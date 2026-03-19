export { getCurrentUserMasterId } from './getCurrentUserMasterId';

export const getRoleColor = (role: string, isDark: boolean) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return '#DC143C'; // Красный для админа
    case 'MASTER':
      return isDark ? '#7B2CBF' : '#6A4C93'; // Темно-фиолетовый для мастера
    case 'CLIENT':
      return isDark ? '#4A90E2' : '#5DADE2'; // Голубой для клиента
    default:
      return isDark ? '#9e9e9e' : '#757575';
  }
};

export const getRoleGradient = (role: string, isDark: boolean) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'linear-gradient(135deg, #DC143C 0%, #FF6B6B 100%)';
    case 'MASTER':
      return isDark
        ? 'linear-gradient(135deg, #7B2CBF 0%, #9D4EDD 100%)'
        : 'linear-gradient(135deg, #6A4C93 0%, #8B6FA8 100%)';
    case 'CLIENT':
      return isDark
        ? 'linear-gradient(135deg, #4A90E2 0%, #6BB6FF 100%)'
        : 'linear-gradient(135deg, #5DADE2 0%, #85C1E9 100%)';
    default:
      return undefined;
  }
};

export const formatRole = (role: string) => {
  if (!role) return 'Unknown';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};
