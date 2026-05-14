import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Search, History, Trash2, Tag, User, Wrench, Star } from 'lucide-react';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useDebounce } from '@/hooks/useDebounce';
import { useMastersSuggestQuery } from '@/features/masters/mastersApi';
import { cn } from '@/lib/utils';
import type { SuggestCategoryItem, SuggestMasterItem, SuggestServiceItem } from '@/types';

export interface SearchSuggestionEvent {
  type: 'category' | 'master' | 'service' | 'text';
  value: string;
  category?: SuggestCategoryItem;
  master?: SuggestMasterItem;
  service?: SuggestServiceItem;
}

interface SearchInputWithHistoryProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  /** Called when user selects a structured suggestion (category, master, service) */
  onSuggestionSelect?: (event: SearchSuggestionEvent) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  variant?: 'hero' | 'default';
  id?: string;
  /** City ID to pass to suggest API for local boosting */
  cityId?: string;
}

export function SearchInputWithHistory({
  value,
  onChange,
  onSubmit,
  onSuggestionSelect,
  placeholder,
  className,
  inputClassName,
  variant = 'default',
  id,
  cityId,
}: SearchInputWithHistoryProps) {
  const { t } = useTranslation();
  const { add, getFiltered, clear, refresh } = useSearchHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedValue = value.trim();
  const debouncedQuery = useDebounce(trimmedValue, 250);
  const shouldFetchSuggestions = debouncedQuery.length >= 2;

  const { data: suggestions } = useMastersSuggestQuery(
    { q: debouncedQuery, limit: 5, cityId },
    { skip: !shouldFetchSuggestions },
  );

  const filtered = getFiltered(value);
  const hasHistory = filtered.length > 0;
  const hasSuggestions =
    shouldFetchSuggestions &&
    suggestions &&
    (suggestions.categories.length > 0 ||
      suggestions.masters.length > 0 ||
      suggestions.services.length > 0);
  const showDropdown = isOpen && (hasHistory || hasSuggestions);

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

  const handleCategorySelect = (cat: SuggestCategoryItem) => {
    setIsOpen(false);
    if (onSuggestionSelect) {
      onSuggestionSelect({ type: 'category', value: cat.slug, category: cat });
    } else {
      onChange(cat.name);
      onSubmit?.(cat.name);
    }
  };

  const handleMasterSelect = (master: SuggestMasterItem) => {
    setIsOpen(false);
    if (onSuggestionSelect) {
      onSuggestionSelect({ type: 'master', value: master.slug, master });
    } else {
      onChange(master.name);
      onSubmit?.(master.name);
    }
  };

  const handleServiceSelect = (service: SuggestServiceItem) => {
    setIsOpen(false);
    if (onSuggestionSelect) {
      onSuggestionSelect({ type: 'service', value: service.title, service });
    } else {
      onChange(service.title);
      onSubmit?.(service.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (e.key === 'Enter' && value.trim()) {
      add(value.trim());
      onSubmit?.(value.trim());
      setIsOpen(false);
    }
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clear();
    setIsOpen(false);
  };

  const isHero = variant === 'hero';
  const hasValue = trimmedValue.length > 0;

  const itemClass = cn(
    'relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-2 pl-2.5 pr-3 text-sm outline-none transition-colors',
    'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
    'text-popover-foreground',
  );

  const sectionHeaderClass = cn(
    'px-3 py-2 border-b flex items-center gap-2',
    'border-gray-200/70 dark:border-white/[0.06]',
    'bg-[hsl(var(--popover))] text-popover-foreground',
  );

  const dropdownContent = showDropdown && (
    <div
      data-search-history-dropdown
      className={cn(
        'fixed z-[9999] rounded-xl border overflow-hidden',
        'border-gray-200 dark:border-white/[0.08]',
        'bg-[hsl(var(--popover))] text-popover-foreground',
        'shadow-xl shadow-black/10 dark:shadow-black/40',
        'animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
      )}
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        minWidth: 320,
        maxWidth: 'min(520px, 92vw)',
      }}
    >
      <div className="max-h-[360px] overflow-y-auto bg-[hsl(var(--popover))]">
        {/* --- Categories --- */}
        {hasSuggestions && suggestions.categories.length > 0 && (
          <>
            <div className={sectionHeaderClass}>
              <Tag className="h-3.5 w-3.5 text-primary dark:text-[#E97525]" />
              <span className="text-xs font-medium text-muted-foreground">
                {t('masters.suggestCategories')}
              </span>
            </div>
            <ul className="p-1">
              {suggestions.categories.map((cat) => (
                <li key={cat.id}>
                  <button type="button" onClick={() => handleCategorySelect(cat)} className={itemClass}>
                    {cat.icon && <span className="text-base">{cat.icon}</span>}
                    <span className="flex-1 text-left truncate">
                      {t(`categories.${cat.slug}`, { defaultValue: cat.name })}
                    </span>
                    <span className="text-xs opacity-60 shrink-0">
                      {t('masters.suggestMastersCount', { count: cat.count })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* --- Services --- */}
        {hasSuggestions && suggestions.services.length > 0 && (
          <>
            <div className={sectionHeaderClass}>
              <Wrench className="h-3.5 w-3.5 text-primary dark:text-[#E97525]" />
              <span className="text-xs font-medium text-muted-foreground">
                {t('masters.suggestServices')}
              </span>
            </div>
            <ul className="p-1">
              {suggestions.services.map((svc) => (
                <li key={svc.title}>
                  <button type="button" onClick={() => handleServiceSelect(svc)} className={itemClass}>
                    <span className="flex-1 text-left truncate">{svc.title}</span>
                    {svc.categoryName && (
                      <span className="text-xs opacity-50 shrink-0 truncate max-w-[120px]">
                        {t(`categories.${svc.categorySlug}`, { defaultValue: svc.categoryName })}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* --- Masters --- */}
        {hasSuggestions && suggestions.masters.length > 0 && (
          <>
            <div className={sectionHeaderClass}>
              <User className="h-3.5 w-3.5 text-primary dark:text-[#E97525]" />
              <span className="text-xs font-medium text-muted-foreground">
                {t('masters.suggestMasters')}
              </span>
            </div>
            <ul className="p-1">
              {suggestions.masters.map((master) => (
                <li key={master.id}>
                  <button type="button" onClick={() => handleMasterSelect(master)} className={itemClass}>
                    <span className="flex-1 text-left truncate">{master.name}</span>
                    <span className="flex items-center gap-1 text-xs opacity-50 shrink-0">
                      <Star className="h-3 w-3 fill-current" />
                      {master.rating.toFixed(1)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* --- Search History --- */}
        {hasHistory && (
          <>
            <div className={cn(sectionHeaderClass, 'justify-between')}>
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
            <ul className="p-1">
              {filtered.map((term) => (
                <li key={term}>
                  <button type="button" onClick={() => handleSelect(term)} className={itemClass}>
                    <History className="h-3.5 w-3.5 opacity-40 shrink-0" />
                    <span className="flex-1 text-left truncate">{term}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
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
              <Search size={18} className="text-primary dark:text-[#E97525] shrink-0 pointer-events-none" />
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
                : 'h-9 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-stone-50/80 dark:bg-white/[0.03] px-3 py-1 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 dark:border-white/[0.08] dark:bg-white/[0.03]',
              !isHero && (hasValue ? 'pl-3' : 'pl-9'),
              inputClassName,
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
