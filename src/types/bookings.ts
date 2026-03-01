/**
 * Booking status and filter options.
 */

export const BOOKING_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
export type BookingStatus = (typeof BOOKING_STATUS_OPTIONS)[number];

export type BookingMasterRef = {
  id: string;
  slug?: string | null;
  user?: { firstName?: string | null; lastName?: string | null; isVerified?: boolean | null } | null;
  city?: { id: string; name: string; slug?: string } | null;
  category?: { id: string; name: string; slug?: string; icon?: string | null } | null;
} | null;

export type BookingLeadRef = {
  id: string;
  status: string;
  clientName?: string | null;
  clientPhone: string;
  message?: string | null;
  createdAt: string;
} | null;

export type BookingDto = {
  id: string;
  masterId: string;
  leadId?: string | null;
  clientPhone: string;
  clientName?: string | null;
  clientId?: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus | string;
  notes?: string | null;
  serviceName?: string | null;
  createdAt: string;
  updatedAt: string;

  master?: BookingMasterRef;
  lead?: BookingLeadRef;
};

export type BookingAvailableSlotDto = {
  start: string;
  end: string;
  available: boolean;
};

export type BookingAvailableSlotsResponse = {
  date: string;
  slots: BookingAvailableSlotDto[];
  slotDurationMinutes: number;
  workStartHour: number;
  workEndHour: number;
  bookings: BookingDto[];
};

export type BookingsCalendarResponse = {
  bookings: BookingDto[];
  leadsWithoutBooking: Array<{
    id: string;
    status: string;
    clientName?: string | null;
    clientPhone: string;
    message: string;
    createdAt: string;
    master?: {
      id: string;
      slug?: string | null;
      user?: { firstName?: string | null; lastName?: string | null } | null;
      category?: { id: string; name: string } | null;
      city?: { id: string; name: string } | null;
    } | null;
  }>;
};

export type BookingRebookInfoResponse = {
  masterId: string;
  masterName?: string;
  masterSlug?: string | null;
  serviceName?: string;
  notes?: string;
  clientPhone: string;
  clientName?: string;
  preferredHour: number;
  preferredMinute: number;
  durationMinutes: number;
  category?: { id: string; name: string; slug: string; icon?: string | null } | null;
  city?: { id: string; name: string; slug: string } | null;
};
