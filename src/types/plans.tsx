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
        'Public profile',
        'Up to 5 photos',
        'Receive leads',
        'Reviews',
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
        'VIP badge',
        'Higher in search results',
        'Up to 10 photos',
        'Phone visible immediately',
        'Basic analytics',
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
        'Top positions in catalog',
        'Featured on homepage',
        'Up to 15 photos',
        'Auto-boost profile',
        'Advanced analytics',
        'Availability status & leads limit',
        'Export leads & analytics (CSV, Excel, PDF)',
        'Telegram / WhatsApp button',
      ],
      highlight: false,
      tariffType: 'PREMIUM',
      icon: <Zap className="size-5" />,
    },
  ] as const;