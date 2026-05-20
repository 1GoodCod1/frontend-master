import { useState, useRef, useCallback, useEffect, Suspense, KeyboardEvent } from 'react';
import { lazyWithRetry } from '@/utils/lazyWithRetry';
import { Send, Paperclip, X, Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { EmojiClickData } from 'emoji-picker-react';

const LazyEmojiPicker = lazyWithRetry(() => import('emoji-picker-react'));
const THEME_DARK = 'dark' as unknown as import('emoji-picker-react').Theme;
const THEME_LIGHT = 'light' as unknown as import('emoji-picker-react').Theme;
import { Button } from '@/components/ui/button';
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
import { validateChatFiles } from '@/utils/validateFile';
import { toErrorMessage } from '@/utils/errors';
import { CHAT_INPUT_BAR_CLS } from '@/features/chat/chatStyles';

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

  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadFiles, { isLoading: isUploading }] = useFilesUploadManyMutation();
  const [emojiPopoverOpen, setEmojiPopoverOpen] = useState(false);

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
        toast.error(toErrorMessage(err) ?? t('common.uploadFailed'));
        return;
      }
    }

    onSend(trimmed, fileIds.length > 0 ? fileIds : undefined);
    setMessage('');
    previews.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {
        /* noop */
      }
    });
    setPreviews([]);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (selectedFiles.length === 0) return;

    const remaining = MAX_ATTACH_FILES - files.length;
    const { valid, errors } = validateChatFiles(selectedFiles, remaining);
    if (errors.length > 0) {
      const msgs = [...new Set(errors)].map((k) => t(k));
      toast.error(msgs.join('. '));
    }
    if (valid.length === 0) return;

    const newPreviews = valid
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => URL.createObjectURL(f));

    setFiles((prev) => [...prev, ...valid]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    const file = files[index];
    if (file?.type.startsWith('image/') && previews[index]) {
      try {
        URL.revokeObjectURL(previews[index]);
      } catch {
        /* noop */
      }
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = !disabled && !isUploading && (message.trim().length > 0 || files.length > 0);

  const handleEmojiClick = (data: EmojiClickData) => {
    setMessage((prev) => prev + data.emoji);
    handleTyping();
  };

  return (
    <div className={CHAT_INPUT_BAR_CLS}>
      {files.length > 0 ? (
        <div className="mb-1.5 flex w-full flex-wrap gap-1 px-0.5">
          {files.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="inline-flex max-w-[180px] items-center gap-1 rounded-lg border border-[#E9ECEF] bg-[#F4F5F7] px-1.5 py-0.5 text-[10px] dark:border-white/10 dark:bg-white/[0.06]"
            >
              {previews[index] ? (
                <img src={previews[index]} alt="" className="size-5 shrink-0 rounded object-cover" />
              ) : null}
              <span className="truncate text-[#495057] dark:text-white/70">
                {file.name.length > 18 ? `${file.name.slice(0, 15)}…` : file.name}
              </span>
              <button
                type="button"
                className="shrink-0 rounded p-0.5 text-[#6C757D] hover:bg-[#E97525]/10 hover:text-[#E97525]"
                onClick={() => removeFile(index)}
                aria-label={t('common.remove')}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex w-full items-end gap-0.5 rounded-[14px] border border-[#E9ECEF] bg-[#F4F5F7] px-1 py-1 focus-within:border-[#E97525]/40 focus-within:ring-2 focus-within:ring-[#E97525]/15 dark:border-white/10 dark:bg-white/[0.04]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-[10px] text-[#6C757D] hover:text-[#E97525] dark:text-white/50"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                <Paperclip className="size-4" />
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

        <Popover open={emojiPopoverOpen} onOpenChange={setEmojiPopoverOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-[10px] text-[#6C757D] hover:text-[#E97525] dark:text-white/50"
                    disabled={disabled}
                  >
                    <Smile className="size-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>{t('common.emoji')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-auto border-0 p-0 shadow-lg" align="start" side="top">
            {emojiPopoverOpen ? (
              <Suspense
                fallback={
                  <div className="flex h-[320px] w-[300px] items-center justify-center">
                    <span className="size-5 animate-spin rounded-full border-2 border-[#E97525] border-t-transparent" />
                  </div>
                }
              >
                <LazyEmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={
                    typeof document !== 'undefined' && document.documentElement?.classList?.contains('dark')
                      ? THEME_DARK
                      : THEME_LIGHT
                  }
                  width={300}
                  height={320}
                />
              </Suspense>
            ) : null}
          </PopoverContent>
        </Popover>

        <textarea
          className="max-h-20 min-h-[32px] flex-1 resize-none border-0 bg-transparent py-1.5 text-[13px] leading-snug text-[#212529] placeholder:text-[#6C757D]/80 focus:outline-none focus-visible:ring-0 dark:text-white/90"
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
          className="mb-0.5 size-8 shrink-0 rounded-full bg-[#E97525] text-white shadow-none hover:bg-[#d86920] disabled:opacity-40"
          onClick={handleSend}
          disabled={!canSend}
        >
          {isUploading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
