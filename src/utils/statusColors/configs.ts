import type { StatusColorConfig } from './createStatusColorMap';

export const BOOKING_STATUS_CONFIG: StatusColorConfig = {
  PENDING: { colorLight: '#FFA726', colorDark: '#ffb74d', bgLight: 'rgba(255, 167, 38, 0.1)', bgDark: 'rgba(255, 183, 77, 0.15)' },
  CONFIRMED: { colorLight: '#42A5F5', colorDark: '#64b5f6', bgLight: 'rgba(66, 165, 245, 0.1)', bgDark: 'rgba(100, 181, 246, 0.15)' },
  COMPLETED: { colorLight: '#66BB6A', colorDark: '#81c784', bgLight: 'rgba(102, 187, 106, 0.1)', bgDark: 'rgba(129, 199, 132, 0.15)' },
  CANCELLED: { colorLight: '#EF5350', colorDark: '#e57373', bgLight: 'rgba(239, 83, 80, 0.1)', bgDark: 'rgba(229, 115, 115, 0.15)' },
};

export const LEAD_STATUS_CONFIG: StatusColorConfig = {
  NEW: { colorLight: '#4A90E2', colorDark: '#ff8a50', bgLight: 'rgba(74, 144, 226, 0.1)', bgDark: 'rgba(255, 138, 80, 0.15)' },
  IN_PROGRESS: { colorLight: '#FFA726', colorDark: '#ffb74d', bgLight: 'rgba(255, 167, 38, 0.1)', bgDark: 'rgba(255, 183, 77, 0.15)' },
  CLOSED: { colorLight: '#66BB6A', colorDark: '#81c784', bgLight: 'rgba(102, 187, 106, 0.1)', bgDark: 'rgba(129, 199, 132, 0.15)' },
  SPAM: { colorLight: '#EF5350', colorDark: '#e57373', bgLight: 'rgba(239, 83, 80, 0.1)', bgDark: 'rgba(229, 115, 115, 0.15)' },
};

export const REPORT_STATUS_CONFIG: Record<string, string> = {
  PENDING: '#F39C12',
  REVIEWED: '#4A90E2',
  RESOLVED: '#27AE60',
  REJECTED: '#DC143C',
};
