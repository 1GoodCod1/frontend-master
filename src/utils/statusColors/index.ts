/**
 * Status color utilities for bookings and leads
 */

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED' | 'SPAM';

/**
 * Get status color for booking status
 */
export function getBookingStatusColor(status: string, isDark: boolean): string {
  switch (status) {
    case 'PENDING':
      return isDark ? '#ffb74d' : '#FFA726';
    case 'CONFIRMED':
      return isDark ? '#64b5f6' : '#42A5F5';
    case 'COMPLETED':
      return isDark ? '#81c784' : '#66BB6A';
    case 'CANCELLED':
      return isDark ? '#e57373' : '#EF5350';
    default:
      return isDark ? '#757575' : '#9E9E9E';
  }
}

/**
 * Get status background color for booking status
 */
export function getBookingStatusBgColor(status: string, isDark: boolean): string {
  switch (status) {
    case 'PENDING':
      return isDark ? 'rgba(255, 183, 77, 0.15)' : 'rgba(255, 167, 38, 0.1)';
    case 'CONFIRMED':
      return isDark ? 'rgba(100, 181, 246, 0.15)' : 'rgba(66, 165, 245, 0.1)';
    case 'COMPLETED':
      return isDark ? 'rgba(129, 199, 132, 0.15)' : 'rgba(102, 187, 106, 0.1)';
    case 'CANCELLED':
      return isDark ? 'rgba(229, 115, 115, 0.15)' : 'rgba(239, 83, 80, 0.1)';
    default:
      return isDark ? 'rgba(117, 117, 117, 0.1)' : 'rgba(158, 158, 158, 0.1)';
  }
}

/**
 * Get status color for lead status
 */
export function getLeadStatusColor(status: string, isDark: boolean): string {
  switch (status) {
    case 'NEW':
      return isDark ? '#ff8a50' : '#4A90E2';
    case 'IN_PROGRESS':
      return isDark ? '#ffb74d' : '#FFA726';
    case 'CLOSED':
      return isDark ? '#81c784' : '#66BB6A';
    case 'SPAM':
      return isDark ? '#e57373' : '#EF5350';
    default:
      return isDark ? '#757575' : '#9E9E9E';
  }
}

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

/**
 * Get status background color for lead status
 */
export function getLeadStatusBgColor(status: string, isDark: boolean): string {
  switch (status) {
    case 'NEW':
      return isDark ? 'rgba(255, 138, 80, 0.15)' : 'rgba(74, 144, 226, 0.1)';
    case 'IN_PROGRESS':
      return isDark ? 'rgba(255, 183, 77, 0.15)' : 'rgba(255, 167, 38, 0.1)';
    case 'CLOSED':
      return isDark ? 'rgba(129, 199, 132, 0.15)' : 'rgba(102, 187, 106, 0.1)';
    case 'SPAM':
      return isDark ? 'rgba(229, 115, 115, 0.15)' : 'rgba(239, 83, 80, 0.1)';
    default:
      return isDark ? 'rgba(117, 117, 117, 0.1)' : 'rgba(158, 158, 158, 0.1)';
  }
}
