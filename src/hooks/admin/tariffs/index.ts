import type { Tariff } from '@/features/tariffs/tariffsApi';

export type AdminTariffRow = Tariff & {
  [k: string]: unknown;
};

export { useAdminTariffs } from './useAdminTariffs';
