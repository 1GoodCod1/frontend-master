import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { prefsCookies } from '@/utils/prefsCookies';

export type ColorMode = 'light' | 'dark';

/** Single source of truth: persist:root (Redux persist). Cookie only for fallback. */
function readInitialMode(): ColorMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = localStorage.getItem('persist:root');
    if (raw) {
      const parsed = JSON.parse(raw) as { ui?: string };
      const ui = parsed?.ui ? (JSON.parse(parsed.ui) as { colorMode?: string }) : null;
      if (ui?.colorMode === 'light' || ui?.colorMode === 'dark') return ui.colorMode;
    }
  } catch {
    //
  }
  try {
    const fromCookie = prefsCookies.theme.get();
    if (fromCookie === 'light' || fromCookie === 'dark') return fromCookie;
  } catch {
    //
  }
  return 'light';
}

/** Sync to cookie only. Redux persist handles persist:root automatically. */
function persistTheme(mode: ColorMode): void {
  try {
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