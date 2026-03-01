import type { RootState } from '@/app/store';

export const selectTokens = (s: RootState) => s.auth.tokens;
export const selectAccessToken = (s: RootState) => s.auth.tokens?.accessToken ?? null;
export const selectRefreshToken = (s: RootState) => s.auth.tokens?.refreshToken ?? null;
export const selectMe = (s: RootState) => s.auth.me;
export const selectRole = (s: RootState) => s.auth.role;
export const selectRestoring = (s: RootState) => s.auth.restoring;
export const selectIsAuthed = (s: RootState) => Boolean(s.auth.tokens?.accessToken && s.auth.tokens.accessToken.trim());
export const selectHasSession = (s: RootState) => Boolean(s.auth.tokens?.refreshToken && s.auth.tokens.refreshToken.trim());
export const selectPlan = (s: RootState) => s.auth.plan;
export const selectIsVerified = (s: RootState) => Boolean(s.auth.me?.isVerified);
