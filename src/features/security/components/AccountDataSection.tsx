import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useUsersDeleteSelfMutation,
  useLazyUsersExportPersonalDataQuery,
} from '@/features/users/usersApi';

export function AccountDataSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [deleteSelf, { isLoading: isDeleting }] = useUsersDeleteSelfMutation();
  const [triggerExport, { isFetching: isExporting }] =
    useLazyUsersExportPersonalDataQuery();

  const [confirmText, setConfirmText] = useState('');

  const handleExport = useCallback(async () => {
    try {
      const locale = i18n.language?.toLowerCase().startsWith('ru')
        ? 'ru'
        : i18n.language?.toLowerCase().startsWith('ro')
          ? 'ro'
          : 'en';
      const blob = await triggerExport({ locale }).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('security.exportSuccess'));
    } catch {
      toast.error(t('security.exportError'));
    }
  }, [triggerExport, t, i18n]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteSelf().unwrap();
      toast.success(t('security.deleteSuccess'));
      navigate('/');
    } catch {
      toast.error(t('security.deleteError'));
    }
  }, [deleteSelf, navigate, t]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-sm font-semibold">
          {t('security.exportTitle')}
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          {t('security.exportDescription')}
        </p>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {isExporting
            ? t('security.exporting')
            : t('security.exportButton')}
        </Button>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="mb-1 text-sm font-semibold text-destructive">
          {t('security.deleteAccountTitle')}
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          {t('security.deleteAccountDescription')}
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="size-4" />
              {t('security.deleteAccountButton')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('security.deleteConfirmTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('security.deleteConfirmDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <label className="mb-1.5 block text-sm font-medium">
                {t('security.deleteConfirmLabel')}
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText('')}>
                {t('security.deleteCancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {t('security.deleteConfirmButton')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
