import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MeResponse, Role } from '@/types';
import { TariffPlan, effectivePlanFromMe } from './plan';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthState = {
  tokens: Tokens | null;
  me: MeResponse | null;
  role: Role | null;
  plan: TariffPlan | null;
  restoring: boolean; 
};

const initialState: AuthState = {
  tokens: null,
  me: null,
  role: null,
  plan: null,   
  restoring: false
};


const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRestoring(state, action: PayloadAction<boolean>) {
      state.restoring = action.payload;
    },
    setTokens(state, action: PayloadAction<Tokens>) {
      state.tokens = action.payload;
    },
    clearAuth(state) {
      state.tokens = null;
      state.me = null;
      state.role = null;
      state.plan = null;
      state.restoring = false;
    },
    setMe(state, action: PayloadAction<MeResponse | null>) {
      const me = action.payload;
      state.me = me;
      state.role = (action.payload?.role as Role) ?? null;
      state.plan = effectivePlanFromMe(action.payload);
    },
  },
});

export const { setTokens, clearAuth, setMe, setRestoring } = slice.actions;
export default slice.reducer;
