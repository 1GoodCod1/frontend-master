import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  getCookiePreferences,
  setCookiePreferences,
  clearPreferencesData,
  type CookiePreferences,
} from '@/features/cookie-consent/storage';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';
import { Search, UserCircle, MapPin, Eye, BarChart3 } from 'lucide-react';

export interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function CookiePreferencesModal({
  open,
  onOpenChange,
  onSave,
}: CookiePreferencesModalProps) {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<CookiePreferences>(() =>
    getCookiePreferences()
  );

  const handleToggle = (key: keyof CookiePreferences, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const handleSave = () => {
    clearPreferencesData(prefs);
    setCookiePreferences(prefs);
    if (prefs.city) {
      window.dispatchEvent(new CustomEvent('mh:cityConsentChanged'));
    }
    onSave?.();
    onOpenChange(false);
  };

  const handleRejectAll = () => {
    setPrefs({
      searchHistory: false,
      session: false,
      city: false,
      recentViews: false,
      analytics: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-md', surfaceCardCls)}>
        <DialogHeader className="px-6 pt-5 pb-4 pr-12">
          <DialogTitle className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {t('cookieConsent.preferencesTitle')}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('cookieConsent.preferencesDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-1 px-5 py-3">
          {/* Search history */}
          <PreferenceRow
            icon={<Search className="size-4 text-sky-600 dark:text-sky-400" />}
            title={t('cookieConsent.preferenceSearchHistory')}
            description={t('cookieConsent.preferenceSearchHistoryDesc')}
            checked={prefs.searchHistory}
            onCheckedChange={(v) => handleToggle('searchHistory', v)}
          />
          {/* Session */}
          <PreferenceRow
            icon={<UserCircle className="size-4 text-violet-600 dark:text-violet-400" />}
            title={t('cookieConsent.preferenceSession')}
            description={t('cookieConsent.preferenceSessionDesc')}
            checked={prefs.session}
            onCheckedChange={(v) => handleToggle('session', v)}
          />
          {/* City */}
          <PreferenceRow
            icon={<MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />}
            title={t('cookieConsent.preferenceCity')}
            description={t('cookieConsent.preferenceCityDesc')}
            checked={prefs.city}
            onCheckedChange={(v) => handleToggle('city', v)}
          />
          {/* Recently viewed */}
          <PreferenceRow
            icon={<Eye className="size-4 text-amber-600 dark:text-amber-400" />}
            title={t('cookieConsent.preferenceRecentViews')}
            description={t('cookieConsent.preferenceRecentViewsDesc')}
            checked={prefs.recentViews}
            onCheckedChange={(v) => handleToggle('recentViews', v)}
          />
          {/* Analytics */}
          <PreferenceRow
            icon={<BarChart3 className="size-4 text-rose-600 dark:text-rose-400" />}
            title={t('cookieConsent.preferenceAnalytics')}
            description={t('cookieConsent.preferenceAnalyticsDesc')}
            checked={prefs.analytics}
            onCheckedChange={(v) => handleToggle('analytics', v)}
          />
        </DialogBody>
        <DialogFooter className="flex-col gap-2 px-5 py-3 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRejectAll}
            className="text-muted-foreground hover:text-foreground order-2 sm:order-1 text-xs"
          >
            {t('cookieConsent.rejectAll')}
          </Button>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 dark:bg-[#E97525] dark:hover:bg-[#f08a3d]"
            >
              {t('cookieConsent.savePreferences')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreferenceRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
        'bg-white/70 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.05]',
        'border border-gray-200/70 dark:border-white/[0.06]',
      )}
    >
      <div className="shrink-0 rounded-lg bg-gray-100 dark:bg-white/[0.04] p-1.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 dark:text-slate-100 text-[13px] leading-tight">
          {title}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        variant="default"
        size="large"
        className="shrink-0 data-[state=checked]:bg-[hsl(var(--primary))] data-[state=checked]:border-[hsl(var(--primary))] dark:data-[state=checked]:bg-[#E97525] dark:data-[state=checked]:border-[#E97525]"
      />
    </div>
  );
}
