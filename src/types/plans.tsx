import type React from 'react';
import { Star, Zap } from 'lucide-react';
import { TariffPlan as PlanName, PaidTariff } from '@/features/auth/plan';

export type PlanUI = {
  name: PlanName;
  price: string;
  description: string;
  features: readonly string[];
  highlight: boolean;
  tariffType: PaidTariff | null;
  icon?: React.ReactNode;
};

export const plans: readonly PlanUI[] = [
    {
      name: 'BASIC',
      price: '0 MDL',
      description: 'Start and receive first leads',
      features: [
        '20 joints / month',
        'Public profile',
        'Up to 5 photos',
        'Receive leads',
        'Reviews',
        'Basic analytics',
      ],
      highlight: false,
      tariffType: null,
      icon: null
    },
    {
      name: 'VIP',
      price: '149 MDL / month',
      description: 'More visibility, more clients',
      features: [
        '100 joints / month',
        'VIP badge',
        'Higher in search results',
        'Up to 10 photos',
        'Basic analytics',
        'Telegram notifications',
      ],
      highlight: true,
      tariffType: 'VIP',
      icon: <Star className="size-5" />,
    },
    {
      name: 'PREMIUM',
      price: '299 MDL / month',
      description: 'Maximum exposure & leads',
      features: [
        '200 joints / month',
        'Top positions in catalog',
        'Featured on homepage',
        'Up to 15 photos',
        'Auto-boost profile',
        'Advanced analytics',
        'Availability status & leads limit',
        'Export leads & analytics (CSV, Excel, PDF)',
        'Service promotions & discounts',
        'Telegram notifications',
      ],
      highlight: false,
      tariffType: 'PREMIUM',
      icon: <Zap className="size-5" />,
    },
  ] as const;