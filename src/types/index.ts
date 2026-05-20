import { ReactNode } from "react";
import type { LeadNotifyChannelInput } from '@/constants/leadNotifyChannel';

export * from './chat';
export * from './jobs';
export * from './leads';
export * from './payments';
export * from './reviews';
export * from './masterDetailsReviews';
export * from './verificationPage';
export * from './ui';
export * from './admin';
export * from './bookings';
export * from './masters';
export * from './categories';
export * from './cities';
export * from './promotions';
export * from './portfolio';
export * from './recommendations';
export * from './favorites';

export type RegisterDto = {
  email: string;
  phone: string;
  password: string;
  role: 'CLIENT' | 'MASTER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  city?: string;
  category?: string;
  description?: string;
  referralCode?: string;
  acceptedLegal: boolean;
  acceptedAge: boolean;
};

export type LoginDto = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RefreshTokenDto = {
  refreshToken: string;
};

export type UpdateUserDto = {
  email?: string;
  phone?: string;
  role?: 'CLIENT' | 'MASTER' | 'ADMIN';
  isVerified?: boolean;
};

export type MasterServicePriceType = 'FIXED' | 'NEGOTIABLE';
export type MasterServiceCurrency = 'MDL' | 'EUR' | 'USD';

export type MasterServiceItem = {
  title: string;
  priceType: MasterServicePriceType;
  price?: number;
  currency?: MasterServiceCurrency;
};

export type UpdateMasterDto = {
  firstName?: string;
  lastName?: string;
  description?: string;
  avatar?: string;
  cityId?: string;
  categoryId?: string;
  experienceYears?: number;
  telegramChatId?: string;
  services?: MasterServiceItem[];
};

export type LeadNotifyChannel = LeadNotifyChannelInput;

export type UpdateNotificationSettingsDto = {
  telegramChatId?: string | null;
  leadNotifyChannel?: LeadNotifyChannel | null;
  notifyTariffSms?: boolean;
  notifyTariffInApp?: boolean;
};

export type NotificationSettings = {
  telegramChatId: string | null;
  leadNotifyChannel: string | null;
  notifyTariffSms: boolean;
  notifyTariffInApp: boolean;
};

export type CreateCategoryDto = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  iconKey?: string;
  iconUrl?: string;
  translations?: Record<string, { name?: string; description?: string }>;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdateCategoryDto = {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  iconKey?: string;
  iconUrl?: string;
  translations?: Record<string, { name?: string; description?: string }>;
  isActive?: boolean;
  sortOrder?: number;
};

export type CreateCityDto = {
  name: string;
  slug: string;
  translations?: Record<string, { name?: string }>;
  isActive?: boolean;
};

export type UpdateCityDto = {
  name?: string;
  slug?: string;
  translations?: Record<string, { name?: string }>;
  isActive?: boolean;
};

export type CreateLeadDto = {
  masterId: string;
  message: string;
  clientName?: string;
  fileUrl?: string;
  fileIds?: string[];
};

export type UpdateLeadStatusDto = {
  status: 'NEW' | 'IN_PROGRESS' | 'PENDING_CLOSE' | 'CLOSED' | 'SPAM';
};

export type CreateReviewCriteriaInput = {
  criteria: string;
  rating: number;
};

export type CreateReviewDto = {
  masterId: string;
  leadId: string;
  clientPhone?: string;
  clientName?: string;
  rating: number;
  comment?: string;
  fileIds?: string[];
  criteria?: CreateReviewCriteriaInput[];
};

export type UpdateReviewStatusDto = {
  status: 'PENDING' | 'VISIBLE' | 'HIDDEN' | 'REPORTED';
  moderationReason?: string;
};

export type FileDto = {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt?: string;
  type?: import('@/constants/fileType').FileType | null;
};

export const PAID_TARIFFS = ['PLUS', 'PRO'] as const;
export type PaidTariff = (typeof PAID_TARIFFS)[number];

export const PLAN_NAMES = ['BASIC', 'PLUS', 'PRO'] as const;
export type PlanName = (typeof PLAN_NAMES)[number];

export type Plan = {
  name: PlanName;
  price: string;
  description: string;
  features: readonly string[];
  highlight: boolean;
  tariffType: PaidTariff | null;
  icon?: ReactNode | null;
};

export type CreatePaymentDto = {
  masterId: string;
  tariffType: 'BASIC' | 'PLUS' | 'PRO';
};

export type Role = 'CLIENT' | 'MASTER' | 'ADMIN';

export type PublicRole = 'PUBLIC';

export type MeResponse = Record<string, unknown> & {
  id?: string;
  email?: string;
  role?: Role;
  masterId?: string; 
};
