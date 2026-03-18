/**
 * Config-driven status color map. Single source of truth for status styling.
 */

export type StatusColorEntry = {
  colorLight: string;
  colorDark: string;
  bgLight: string;
  bgDark: string;
};

export type StatusColorConfig = Record<string, StatusColorEntry>;

const DEFAULT_LIGHT = '#9E9E9E';
const DEFAULT_DARK = '#757575';
const DEFAULT_BG_LIGHT = 'rgba(158, 158, 158, 0.1)';
const DEFAULT_BG_DARK = 'rgba(158, 158, 158, 0.15)';

export function createStatusColorMap(config: StatusColorConfig) {
  return {
    getColor: (status: string, isDark: boolean): string => {
      const entry = config[status.toUpperCase()];
      if (!entry) return isDark ? DEFAULT_DARK : DEFAULT_LIGHT;
      return isDark ? entry.colorDark : entry.colorLight;
    },
    getBgColor: (status: string, isDark: boolean): string => {
      const entry = config[status.toUpperCase()];
      if (!entry) return isDark ? DEFAULT_BG_DARK : DEFAULT_BG_LIGHT;
      return isDark ? entry.bgDark : entry.bgLight;
    },
  };
}

/** For domains where color doesn't vary by theme (e.g. reports) */
export function createStatusColorMapFixed(config: Record<string, string>) {
  const toBg = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  return {
    getColor: (status: string): string => config[status.toUpperCase()] ?? DEFAULT_LIGHT,
    getBgColor: (status: string, isDark: boolean): string => {
      const hex = config[status.toUpperCase()] ?? DEFAULT_LIGHT;
      return toBg(hex, isDark ? 0.15 : 0.1);
    },
  };
}
