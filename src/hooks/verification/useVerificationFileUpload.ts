import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { validateImageFile } from '@/utils/validateFile';
import { toErrorMessage } from '@/utils/errors';

type UploadTrigger = (args: { file: File }) => { unwrap: () => Promise<unknown> };

export function useVerificationFileUpload(
  t: (key: string) => string,
  uploadFile: UploadTrigger,
) {
  return useCallback(
    async (
      file: File,
      setPreview: (url: string) => void,
      setFileId: (id: string) => void,
    ) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        toast.error(t(validationError));
        return;
      }

      setPreview(URL.createObjectURL(file));

      try {
        const result = (await uploadFile({ file }).unwrap()) as {
          data?: { id?: string; fileId?: string };
          id?: string;
          fileId?: string;
        };
        const fileData = result.data ?? result;
        const fileId = fileData.id ?? fileData.fileId ?? '';
        setFileId(fileId);
        toast.success(t('verification.fileUploaded'));
      } catch (err: unknown) {
        setPreview('');
        toast.error(toErrorMessage(err) ?? t('verification.fileUploadError'));
      }
    },
    [t, uploadFile],
  );
}
