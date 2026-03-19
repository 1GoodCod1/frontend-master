import { useState, useRef, useCallback } from 'react';

export interface ConfirmOptions {
  title: string;
  description?: string;
  color?: 'primary' | 'error';
  action: () => Promise<void>;
}

/**
 * Shared confirm-dialog state for admin CRUD hooks (categories, cities, tariffs, reviews).
 * Eliminates ~30 lines of duplicated state + handlers per hook.
 */
export function useAdminConfirm() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDesc, setConfirmDesc] = useState<string | undefined>(undefined);
  const [confirmColor, setConfirmColor] = useState<'primary' | 'error'>('primary');
  const confirmActionRef = useRef<null | (() => Promise<void>)>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const openConfirm = useCallback((opts: ConfirmOptions) => {
    setConfirmTitle(opts.title);
    setConfirmDesc(opts.description);
    setConfirmColor(opts.color ?? 'primary');
    confirmActionRef.current = opts.action;
    setConfirmOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    const act = confirmActionRef.current;
    if (!act) return;
    setConfirmLoading(true);
    try {
      await act();
      setConfirmOpen(false);
    } catch {
      // errors are toasted in the action
    } finally {
      setConfirmLoading(false);
    }
  }, []);

  const handleCloseConfirm = useCallback(() => {
    if (confirmLoading) return;
    setConfirmOpen(false);
  }, [confirmLoading]);

  return {
    confirmOpen,
    confirmTitle,
    confirmDesc,
    confirmColor,
    confirmLoading,
    openConfirm,
    handleConfirm,
    handleCloseConfirm,
  };
}
