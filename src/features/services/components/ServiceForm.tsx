import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ServiceItem = {
  title: string;
  priceType: 'FIXED' | 'NEGOTIABLE';
  price: number | '';
  currency: 'MDL' | 'EUR' | 'USD';
};

interface ServiceFormProps {
  service: ServiceItem;
  onChange: (updater: (prev: ServiceItem) => ServiceItem) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  saveIcon: React.ReactNode;
  saveLabel: string;
}

export function ServiceForm({
  service,
  onChange,
  onSave,
  onCancel,
  saving,
  saveIcon,
  saveLabel,
}: ServiceFormProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-medium">{t('servicesPage.serviceName')}</Label>
        <Input
          value={service.title}
          onChange={(e) => onChange((s) => ({ ...s, title: e.target.value }))}
          placeholder={t('servicesPage.serviceNamePlaceholder')}
          className="mt-1 rounded-lg bg-background"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">{t('servicesPage.priceType')}</Label>
          <Select
            value={service.priceType}
            onValueChange={(v: 'FIXED' | 'NEGOTIABLE') =>
              onChange((s) => ({ ...s, priceType: v, price: v === 'NEGOTIABLE' ? '' : s.price }))
            }
          >
            <SelectTrigger className="mt-1 rounded-lg bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEGOTIABLE">{t('servicesPage.priceNegotiable')}</SelectItem>
              <SelectItem value="FIXED">{t('servicesPage.priceFixed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {service.priceType === 'FIXED' && (
          <>
            <div>
              <Label className="text-xs">{t('servicesPage.price')}</Label>
              <Input
                type="number"
                min={0}
                value={service.price === '' ? '' : service.price}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') return onChange((s) => ({ ...s, price: '' }));
                  const n = Number(v);
                  if (Number.isFinite(n) && n >= 0) onChange((s) => ({ ...s, price: n }));
                }}
                className="mt-1 rounded-lg bg-background"
              />
            </div>
            <div>
              <Label className="text-xs">{t('servicesPage.currency')}</Label>
              <Select
                value={service.currency}
                onValueChange={(v: 'MDL' | 'EUR' | 'USD') => onChange((s) => ({ ...s, currency: v }))}
              >
                <SelectTrigger className="mt-1 rounded-lg bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MDL">MDL</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" size="sm" onClick={onSave} disabled={saving} className="gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700">
          {saveIcon} {saveLabel}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} className="gap-1 rounded-lg">
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}
