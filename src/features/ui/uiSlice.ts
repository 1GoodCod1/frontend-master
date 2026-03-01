import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { prefsCookies } from '@/utils/prefsCookies';

export type ColorMode = 'light' | 'dark';

const STORAGE_KEY = 'mm_color_mode';

function readInitialMode(): ColorMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const fromCookie = prefsCookies.theme.get();
    if (fromCookie === 'light' || fromCookie === 'dark') return fromCookie;
  } catch {
    //
  }
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'light' || v === 'dark') return v;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  return prefersDark ? 'dark' : 'light';
}

function persistTheme(mode: ColorMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
    prefsCookies.theme.set(mode);
  } catch {
    //
  }
}

export interface UiState {
  colorMode: ColorMode;
}

const initialState: UiState = {
  colorMode: readInitialMode(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setColorMode(state, action: PayloadAction<ColorMode>) {
      state.colorMode = action.payload;
      persistTheme(action.payload);
    },
    toggleColorMode(state) {
      state.colorMode = state.colorMode === 'dark' ? 'light' : 'dark';
      persistTheme(state.colorMode);
    },
  },
});

export const { setColorMode, toggleColorMode } = uiSlice.actions;
export default uiSlice.reducer;