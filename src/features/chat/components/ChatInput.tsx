import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { Send, Paperclip, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFilesUploadManyMutation } from '@/features/files/filesApi';
import { TYPING_DEBOUNCE_MS, MAX_ATTACH_FILES } from '@/features/chat/constants';
import type { ChatInputProps } from '@/types/chat';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export default function ChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder,
  quickReplies,
  onManageQuickReplies,
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
        }
      } catch {
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

  return (
    <div className="border-t border-border/60 bg-muted/20 p-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
      {(onManageQuickReplies || (quickReplies && quickReplies.length > 0)) && (
        <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-2">
            {(quickReplies ?? []).map((qr) => (
              <button
                key={qr.id}
                type="button"
                className="max-w-[240px] shrink-0 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-500/15 dark:text-amber-200"
                onClick={() => setMessage(qr.text)}
                title={qr.text}
              >
                <span className="truncate">{qr.text}</span>
              </button>
            ))}
          </div>
          {onManageQuickReplies && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto shrink-0 gap-2"
              onClick={onManageQuickReplies}
            >
              <Sparkles className="size-4" />
              {t('common.templates', 'Шаблоны')}
            </Button>
          )}
        </div>
      )}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="inline-flex max-w-[200px] items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs"
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

      <div className="flex items-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                <Paperclip className="size-5" />
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

        <Textarea
          className="min-h-[40px] max-h-24 resize-none rounded-xl border-border bg-background focus-visible:ring-2 focus-visible:ring-amber-500/50 dark:border-white/10 dark:bg-white/5"
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
          className="size-10 shrink-0 rounded-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
          onClick={handleSend}
          disabled={!canSend}
        >
          {isUploading ? (
            <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="size-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
