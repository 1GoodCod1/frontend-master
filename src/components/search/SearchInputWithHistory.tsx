import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Search, History, Trash2 } from 'lucide-react';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { cn } from '@/lib/utils';

interface SearchInputWithHistoryProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  variant?: 'hero' | 'default';
  id?: string;
}

export function SearchInputWithHistory({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  inputClassName,
  variant = 'default',
  id,
}: SearchInputWithHistoryProps) {
  const { t } = useTranslation();
  const { add, getFiltered, clear, refresh } = useSearchHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = getFiltered(value);
  const hasHistory = filtered.length > 0;
  const showDropdown = isOpen && hasHistory;

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 12,
        left: rect.left,
        width: Math.max(rect.width, 200),
      });
    }
  };

  const openDropdown = () => {
    refresh();
    updatePosition();
    setIsOpen(true);
  };

  const handleFocus = openDropdown;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-search-history-dropdown]')) {
          setIsOpen(false);
        }
      }
    };
    const handleScroll = () => updatePosition();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (showDropdown) updatePosition();
  }, [showDropdown]);

  const handleSelect = (term: string) => {
    onChange(term);
    setIsOpen(false);
    onSubmit?.(term);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (e.key === 'Enter' && value.trim()) {
      add(value.trim());
      onSubmit?.(value.trim());
    }
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clear();
    setIsOpen(false);
  };

  const isHero = variant === 'hero';
  const hasValue = value.trim().length > 0;

  const dropdownContent = showDropdown && (
    <div
      data-search-history-dropdown
      className={cn(
        'fixed z-[9999] rounded-lg border overflow-hidden',
        'border-amber-200/60 dark:border-white/10',
        'bg-[hsl(var(--popover))] text-popover-foreground',
        'shadow-xl shadow-amber-900/5',
        'animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2'
      )}
      style={{
        top: position.top,
        left: position.left,
        width: Math.max(position.width, 200),
        maxWidth: 'min(400px, 90vw)',
      }}
    >
      <div
        className={cn(
          'px-3 py-2 border-b flex items-center justify-between',
          'border-amber-200/60 dark:border-white/10',
          'bg-[hsl(var(--popover))] text-popover-foreground'
        )}
      >
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <History className="h-3.5 w-3.5" />
          {t('masters.searchHistory')}
        </span>
        <button
          type="button"
          onClick={handleClearHistory}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          {t('masters.clearSearchHistory')}
        </button>
      </div>
      <ul className="max-h-[220px] overflow-y-auto p-1 bg-[hsl(var(--popover))]">
        {filtered.map((term) => (
          <li key={term}>
            <button
              type="button"
              onClick={() => handleSelect(term)}
              className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-3 text-sm outline-none transition-colors',
                'hover:bg-amber-600 hover:text-white focus:bg-amber-600 focus:text-white',
                'text-popover-foreground'
              )}
            >
              {term}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <div
        ref={containerRef}
        className={cn('relative', className)}
        onMouseDown={() => !isOpen && openDropdown()}
      >
        <div className={cn('relative', isHero && 'flex items-center gap-3 flex-1 min-w-0')}>
          {!hasValue && (
            isHero ? (
              <Search size={18} className="text-amber-500 shrink-0 pointer-events-none" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
            )
          )}
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? t('masters.searchPlaceholder')}
            className={cn(
              'w-full bg-transparent text-sm outline-none transition-[padding]',
              isHero
                ? 'text-foreground placeholder:text-muted-foreground'
                : 'h-9 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-stone-50/80 dark:bg-white/[0.03] px-3 py-1 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-amber-600/40 focus-visible:border-amber-300 dark:border-transparent dark:bg-white/[0.03]',
              !isHero && (hasValue ? 'pl-3' : 'pl-9'),
              inputClassName
            )}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </>
  );
}
