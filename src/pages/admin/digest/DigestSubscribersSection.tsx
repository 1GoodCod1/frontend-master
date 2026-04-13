import { UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/button';
import { formatDateTimeString } from '@/utils/date';

type SubscriberItem = {
  id: string;
  userId: string;
  subscribedAt: string;
  user?: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
  };
};

type Meta = { total: number; page: number; limit: number; totalPages: number };

export function DigestSubscribersSection({
  subsLoading,
  items,
  meta,
  locale,
  isUnsubscribing,
  onUnsubscribeClick,
  onPrevPage,
  onNextPage,
}: {
  subsLoading: boolean;
  items: SubscriberItem[];
  meta: Meta;
  locale: string;
  isUnsubscribing: boolean;
  onUnsubscribeClick: (userId: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}) {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('admin.digest.subscribersList', 'Список подписчиков')}>
      {subsLoading ? (
        <p className="py-8 text-center text-muted-foreground">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{t('admin.digest.noSubscribers')}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 text-left font-medium">{t('admin.digest.email', 'Email')}</th>
                  <th className="py-3 text-left font-medium">{t('admin.digest.name', 'Имя')}</th>
                  <th className="py-3 text-left font-medium">{t('admin.digest.role', 'Роль')}</th>
                  <th className="py-3 text-left font-medium">{t('admin.digest.subscribedAt', 'Подписан')}</th>
                  <th className="py-3 text-right font-medium">{t('admin.users.actions', 'Действия')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((sub) => (
                  <tr key={sub.id} className="border-b border-border/50">
                    <td className="py-2">{sub.user?.email ?? '—'}</td>
                    <td className="py-2">
                      {[sub.user?.firstName, sub.user?.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="py-2">{t(`admin.roles.${sub.user?.role}`) ?? sub.user?.role}</td>
                    <td className="py-2 text-muted-foreground">
                      {formatDateTimeString(sub.subscribedAt, locale)}
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onUnsubscribeClick(sub.userId)}
                        disabled={isUnsubscribing}
                      >
                        <UserX className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('common.page')} {meta.page} {t('common.pageOf', { total: meta.totalPages })}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={onPrevPage}>
                  {t('common.prev')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={onNextPage}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}
