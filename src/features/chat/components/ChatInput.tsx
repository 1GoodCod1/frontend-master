import { useState, useRef, useCallback, useEffect, lazy, Suspense, KeyboardEvent } from 'react';
import { Send, Paperclip, X, Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { EmojiClickData } from 'emoji-picker-react';

const LazyEmojiPicker = lazy(() => import('emoji-picker-react'));
const THEME_DARK = 'dark' as unknown as import('emoji-picker-react').Theme;
const THEME_LIGHT = 'light' as unknown as import('emoji-picker-react').Theme;
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFilesUploadManyMutation } from '@/features/files/filesApi';
import { TYPING_DEBOUNCE_MS, MAX_ATTACH_FILES } from '@/features/chat/constants';
import type { ChatInputProps } from '@/types/chat';
import { isRecord } from '@/utils/guards';

export default function ChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder,
}: ChatInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [uploadFiles, { isLoading: isUploading }] = useFilesUploadManyMutation();

  const defaultPlaceholder = t('common.writeMessage');

  const handleTyping = useCallback(() => {
    if (!onTyping) return;
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
      typingTimeoutRef.current = null;
    }, TYPING_DEBOUNCE_MS);
  }, [onTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed && files.length === 0) return;

    let fileIds = [...uploadedFileIds];

    if (files.length > 0) {
      try {
        const result = await uploadFiles({ files }).unwrap();
        const items =
          (result as { data?: { items?: unknown[] }; items?: unknown[] })?.data?.items ??
          (result as { items?: unknown[] })?.items ??
          result;
        if (Array.isArray(items)) {
          const ids = items
            .map((f) => {
              if (!isRecord(f)) return undefined;
              const id = f.id;
              return typeof id === 'string' ? id : undefined;
            })
            .filter((id): id is string => typeof id === 'string' && id.length > 0);
          fileIds = [...fileIds, ...ids];
          if (ids.length === 0) {
            toast.error(t('common.uploadFailed'));
            return;
          }
        } else {
          toast.error(t('common.uploadFailed'));
          return;
        }
      } catch (err) {
        const errObj = err && typeof err === 'object' ? (err as Record<string, unknown>) : null;
        const data = errObj?.data;
        const msg =
          data && typeof data === 'object' && data !== null && 'message' in data
            ? String((data as { message?: unknown }).message ?? t('common.uploadFailed'))
            : t('common.uploadFailed');
        toast.error(msg);
        return;
      }
    }

    onSend(trimmed, fileIds.length > 0 ? fileIds : undefined);
    setMessage('');
    setFiles([]);
    setUploadedFileIds([]);

    if (onTyping) {
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, MAX_ATTACH_FILES));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = !disabled && !isUploading && (message.trim().length > 0 || files.length > 0);

  const handleEmojiClick = (data: EmojiClickData) => {
    setMessage((prev) => prev + data.emoji);
    handleTyping();
  };

  return (
    <div className="border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 p-2.5 sm:p-3">
      {files.length > 0 && (
        <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
          {files.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="inline-flex max-w-[160px] sm:max-w-[200px] items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] sm:text-xs"
            >
              <span className="truncate">
                {file.name.length > 20 ? `${file.name.slice(0, 17)}...` : file.name}
              </span>
              <button
                type="button"
                className="shrink-0 rounded p-0.5 hover:bg-primary/20"
                onClick={() => removeFile(index)}
                aria-label={t('common.remove')}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 sm:gap-2 p-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/40 dark:focus-within:ring-orange-500/15 dark:focus-within:border-orange-500/30 transition-all">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 size-9 sm:size-10 rounded-xl text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                <Paperclip className="size-4 sm:size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.attachFile')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-9 sm:size-10 rounded-xl text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80"
                    disabled={disabled}
                  >
                    <Smile className="size-4 sm:size-5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>{t('common.emoji')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-auto p-0 border-0 shadow-none" align="start" side="top">
            <Suspense fallback={<div className="w-[320px] h-[360px] flex items-center justify-center"><span className="size-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></div>}>
              <LazyEmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={typeof document !== 'undefined' && document.documentElement?.classList?.contains('dark') ? THEME_DARK : THEME_LIGHT}
                width={320}
                height={360}
              />
            </Suspense>
          </PopoverContent>
        </Popover>

        <Textarea
          className="min-h-[36px] sm:min-h-[40px] max-h-20 sm:max-h-24 resize-none rounded-xl border-0 bg-transparent focus-visible:ring-0 focus-visible:shadow-none text-sm sm:text-base flex-1 placeholder:text-slate-400 dark:placeholder:text-white/50"
          placeholder={placeholder ?? defaultPlaceholder}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />

        <Button
          type="button"
          size="icon"
          className="size-9 sm:size-10 shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 hover:shadow-orange-500/40 hover:opacity-95 transition-all"
          onClick={handleSend}
          disabled={!canSend}
        >
          {isUploading ? (
            <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="size-4 sm:size-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
