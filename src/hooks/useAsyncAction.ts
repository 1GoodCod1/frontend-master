import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { toErrorMessage } from '@/utils/errors';

/**
 * Wrap an async action with success/error toasts.
 * Eliminates the repetitive try/catch/toast pattern found in 20+ hooks.
 *
 * @example
 * const run = useAsyncAction();
 * await run(() => mutation(args).unwrap(), { success: 'Saved!', error: 'Save failed' });
 */
export function useAsyncAction() {
  return useCallback(
    async <T>(
      action: () => Promise<T>,
      opts?: {
        success?: string;
        error?: string;
        /** Called after a successful action. */
        onSuccess?: (result: T) => void;
        /** If true, show a loading toast that is replaced by success/error. */
        loading?: string;
      },
    ): Promise<T | undefined> => {
      const loadingId = opts?.loading ? toast.loading(opts.loading) : undefined;
      try {
        const result = await action();
        const msg = opts?.success;
        if (msg) {
          if (loadingId) {
            toast.success(msg, { id: loadingId });
          } else {
            toast.success(msg);
          }
        } else if (loadingId) {
          toast.dismiss(loadingId);
        }
        opts?.onSuccess?.(result);
        return result;
      } catch (e: unknown) {
        const msg = toErrorMessage(e) ?? opts?.error ?? 'Action failed';
        if (loadingId) {
          toast.error(msg, { id: loadingId });
        } else {
          toast.error(msg);
        }
        return undefined;
      }
    },
    [],
  );
}
