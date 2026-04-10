import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  useFilesUploadMutation,
  useFilesUploadManyMutation,
} from '@/features/files/filesApi';
import {
  validateImageFile,
  validateChatFile,
  type FileErrorKey,
} from '@/utils/validateFile';
import type { FileDto } from '@/types';
import { toErrorMessage } from '@/utils/errors';

type ValidatorFn = (file: File) => FileErrorKey | null;

interface UseFileUploadOptions {
  maxFiles?: number;
  mode?: 'image' | 'chat';
  forLead?: boolean;
}

interface UseFileUploadReturn {
  files: File[];
  previews: string[];
  isUploading: boolean;
  pickFiles: (fileList: FileList | File[]) => void;
  upload: () => Promise<FileDto[] | null>;
  removeFile: (index: number) => void;
  clear: () => void;
}

function revokeAll(urls: string[]) {
  urls.forEach((u) => {
    try { URL.revokeObjectURL(u); } catch { /* noop */ }
  });
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { maxFiles = 10, mode = 'image', forLead } = options;
  const { t } = useTranslation();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const previewsRef = useRef<string[]>([]);

  const [uploadOne, uploadOneState] = useFilesUploadMutation();
  const [uploadMany, uploadManyState] = useFilesUploadManyMutation();
  const isUploading = uploadOneState.isLoading || uploadManyState.isLoading;

  const validator: ValidatorFn = mode === 'chat' ? validateChatFile : validateImageFile;

  const pickFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      if (incoming.length === 0) return;

      const accepted: File[] = [];
      const errorKeys = new Set<FileErrorKey>();

      for (const file of incoming) {
        const err = validator(file);
        if (err) {
          errorKeys.add(err);
        } else {
          accepted.push(file);
        }
      }

      if (errorKeys.size > 0) {
        const msgs = [...errorKeys].map((k) => t(k));
        toast.error(msgs.join('. '));
      }
      if (accepted.length === 0) return;

      setFiles((prev) => {
        const remaining = maxFiles - prev.length;
        if (remaining <= 0) {
          toast.error(t('files.tooMany'));
          return prev;
        }
        const toAdd = accepted.slice(0, remaining);
        if (toAdd.length < accepted.length) {
          toast.error(t('files.tooMany'));
        }
        const newPreviews = toAdd
          .filter((f) => f.type.startsWith('image/'))
          .map((f) => URL.createObjectURL(f));
        setPreviews((p) => {
          const merged = [...p, ...newPreviews];
          previewsRef.current = merged;
          return merged;
        });
        return [...prev, ...toAdd];
      });
    },
    [maxFiles, validator, t],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const url = prev[index];
      if (url) {
        try { URL.revokeObjectURL(url); } catch { /* noop */ }
      }
      const next = prev.filter((_, i) => i !== index);
      previewsRef.current = next;
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    revokeAll(previewsRef.current);
    previewsRef.current = [];
    setFiles([]);
    setPreviews([]);
  }, []);

  const upload = useCallback(async (): Promise<FileDto[] | null> => {
    if (files.length === 0) return null;

    try {
      let results: FileDto[];

      if (files.length === 1 && !forLead) {
        const dto = await uploadOne({ file: files[0] }).unwrap();
        results = [dto];
      } else {
        const res = await uploadMany({ files, forLead }).unwrap();
        results = res.items;
      }

      clear();
      return results;
    } catch (err: unknown) {
      toast.error(toErrorMessage(err) ?? t('files.uploadFailed'));
      return null;
    }
  }, [files, forLead, uploadOne, uploadMany, clear, t]);

  return { files, previews, isUploading, pickFiles, upload, removeFile, clear };
}
