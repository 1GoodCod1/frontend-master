export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '#F39C12';
    case 'REVIEWED':
      return '#4A90E2';
    case 'RESOLVED':
      return '#27AE60';
    case 'REJECTED':
      return '#DC143C';
    default:
      return '#9E9E9E';
  }
};

export const getStatusBgColor = (status: string, isDark: boolean) => {
  switch (status) {
    case 'PENDING':
      return isDark ? 'rgba(243, 156, 18, 0.15)' : 'rgba(243, 156, 18, 0.1)';
    case 'REVIEWED':
      return isDark ? 'rgba(74, 144, 226, 0.15)' : 'rgba(74, 144, 226, 0.1)';
    case 'RESOLVED':
      return isDark ? 'rgba(39, 174, 96, 0.15)' : 'rgba(39, 174, 96, 0.1)';
    case 'REJECTED':
      return isDark ? 'rgba(220, 20, 60, 0.15)' : 'rgba(220, 20, 60, 0.1)';
    default:
      return isDark ? 'rgba(158, 158, 158, 0.15)' : 'rgba(158, 158, 158, 0.1)';
  }
};
