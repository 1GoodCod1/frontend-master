/**
 * Status color utilities for bookings, leads, and reports.
 * Single source of truth via config-driven createStatusColorMap.
 */

import { createStatusColorMap, createStatusColorMapFixed } from './createStatusColorMap';
import { BOOKING_STATUS_CONFIG, LEAD_STATUS_CONFIG, REPORT_STATUS_CONFIG } from './configs';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED' | 'SPAM';

const bookingMap = createStatusColorMap(BOOKING_STATUS_CONFIG);
const leadMap = createStatusColorMap(LEAD_STATUS_CONFIG);
const reportMap = createStatusColorMapFixed(REPORT_STATUS_CONFIG);

export const getBookingStatusColor = bookingMap.getColor;
export const getBookingStatusBgColor = bookingMap.getBgColor;
export const getLeadStatusColor = leadMap.getColor;
export const getLeadStatusBgColor = leadMap.getBgColor;
export const getReportStatusColor = reportMap.getColor;
export const getReportStatusBgColor = reportMap.getBgColor;

/** MUI Chip color for booking status (for use with <Chip color={...} />). */
export function getBookingStatusChipColor(status: string): 'warning' | 'info' | 'success' | 'error' | 'default' {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'CONFIRMED': return 'info';
    case 'COMPLETED': return 'success';
    case 'CANCELLED': return 'error';
    default: return 'default';
  }
}
