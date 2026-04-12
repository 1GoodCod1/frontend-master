import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';

const mocks = vi.hoisted(() => ({
  requestMock: vi.fn(),
  clearAuthMock: vi.fn(() => ({ type: 'auth/clearAuth' })),
  setTokensMock: vi.fn((payload: unknown) => ({ type: 'auth/setTokens', payload })),
  persistRefreshTokenMock: vi.fn(),
  setLogoutFlagMock: vi.fn(),
  markHttpOnlySessionHintMock: vi.fn(),
  isHttpOnlyGuestHintMock: vi.fn(() => false),
  getSessionIdMock: vi.fn((): string | null => null),
  shouldBustMock: vi.fn(() => false),
  toastErrorMock: vi.fn(),
  envMock: { apiUrl: 'http://test.local', wsUrl: 'ws://test.local', envName: 'test', useHttpOnly: false },
}));

vi.mock('axios', () => ({
  default: {
    create: () => ({ request: mocks.requestMock }),
  },
}));

vi.mock('@/features/auth/authSlice', () => ({
  clearAuth: mocks.clearAuthMock,
  setTokens: mocks.setTokensMock,
}));

vi.mock('@/features/auth/persist', () => ({
  persistRefreshToken: mocks.persistRefreshTokenMock,
  setLogoutFlag: mocks.setLogoutFlagMock,
  markHttpOnlySessionHint: mocks.markHttpOnlySessionHintMock,
  isHttpOnlyGuestHint: mocks.isHttpOnlyGuestHintMock,
}));

vi.mock('@/services/env', () => ({ env: mocks.envMock }));
vi.mock('@/utils/sessionId', () => ({ getSessionId: mocks.getSessionIdMock }));
vi.mock('@/config/publicCache', () => ({
  shouldBustHttpCacheForPublicGetPath: mocks.shouldBustMock,
}));
vi.mock('react-hot-toast', () => ({
  default: { error: mocks.toastErrorMock },
}));

import { axiosBaseQuery, baseQueryWithReauth } from './api';

type Tokens = { accessToken: string; refreshToken: string } | null;

function fakeApi(tokens: Tokens = { accessToken: 'access-1', refreshToken: 'refresh-1' }): BaseQueryApi {
  return {
    signal: new AbortController().signal,
    abort: () => undefined,
    dispatch: vi.fn() as unknown as BaseQueryApi['dispatch'],
    getState: () => ({ auth: { tokens } }),
    extra: undefined,
    endpoint: 'test',
    type: 'query',
    forced: false,
  } as BaseQueryApi;
}

type HttpError = Error & { response?: { status: number; data: unknown } };

function axiosFailure(status?: number, data: unknown = {}): HttpError {
  const err = new Error(status ? `HTTP ${status}` : 'Network Error') as HttpError;
  if (status != null) err.response = { status, data };
  return err;
}

beforeEach(() => {
  mocks.requestMock.mockReset();
  mocks.clearAuthMock.mockClear();
  mocks.setTokensMock.mockClear();
  mocks.persistRefreshTokenMock.mockClear();
  mocks.setLogoutFlagMock.mockClear();
  mocks.markHttpOnlySessionHintMock.mockClear();
  mocks.isHttpOnlyGuestHintMock.mockReset().mockReturnValue(false);
  mocks.getSessionIdMock.mockReset().mockReturnValue(null);
  mocks.shouldBustMock.mockReset().mockReturnValue(false);
  mocks.toastErrorMock.mockClear();
  mocks.envMock.useHttpOnly = false;
});

describe('axiosBaseQuery', () => {
  it('returns { data } on successful request', async () => {
    const baseQuery = axiosBaseQuery();
    mocks.requestMock.mockResolvedValueOnce({ data: { id: 42 } });

    const result = await baseQuery({ url: '/users/me', method: 'GET' }, fakeApi(), {});

    expect(result).toEqual({ data: { id: 42 } });
    expect(mocks.requestMock).toHaveBeenCalledTimes(1);
  });

  it('attaches Authorization header when accessToken is present in state', async () => {
    const baseQuery = axiosBaseQuery();
    mocks.requestMock.mockResolvedValueOnce({ data: null });

    await baseQuery(
      { url: '/anything', method: 'GET' },
      fakeApi({ accessToken: 'abc', refreshToken: 'xyz' }),
      {},
    );

    const sentHeaders = mocks.requestMock.mock.calls[0][0].headers as Record<string, string>;
    expect(sentHeaders.Authorization).toBe('Bearer abc');
  });

  it('omits Authorization header when there is no accessToken', async () => {
    const baseQuery = axiosBaseQuery();
    mocks.requestMock.mockResolvedValueOnce({ data: null });

    await baseQuery({ url: '/public', method: 'GET' }, fakeApi(null), {});

    const sentHeaders = mocks.requestMock.mock.calls[0][0].headers as Record<string, string>;
    expect(sentHeaders.Authorization).toBeUndefined();
  });

  it('attaches x-session-id when getSessionId returns an id', async () => {
    const baseQuery = axiosBaseQuery();
    mocks.getSessionIdMock.mockReturnValueOnce('sess_abc');
    mocks.requestMock.mockResolvedValueOnce({ data: null });

    await baseQuery({ url: '/foo', method: 'GET' }, fakeApi(), {});

    const sentHeaders = mocks.requestMock.mock.calls[0][0].headers as Record<string, string>;
    expect(sentHeaders['x-session-id']).toBe('sess_abc');
  });

  it('deletes Content-Type header for FormData payloads', async () => {
    const baseQuery = axiosBaseQuery();
    mocks.requestMock.mockResolvedValueOnce({ data: null });
    const form = new FormData();
    form.append('file', 'dummy');

    await baseQuery(
      { url: '/upload', method: 'POST', data: form, headers: { 'Content-Type': 'application/json' } },
      fakeApi(),
      {},
    );

    const sentHeaders = mocks.requestMock.mock.calls[0][0].headers as Record<string, string>;
    expect(sentHeaders['Content-Type']).toBeUndefined();
    expect(sentHeaders['content-type']).toBeUndefined();
  });

  it('adds Cache-Control: no-cache for public GET paths flagged by shouldBust', async () => {
    const baseQuery = axiosBaseQuery();
    mocks.shouldBustMock.mockReturnValueOnce(true);
    mocks.requestMock.mockResolvedValueOnce({ data: [] });

    await baseQuery({ url: '/categories?limit=10', method: 'GET' }, fakeApi(), {});

    expect(mocks.shouldBustMock).toHaveBeenCalledWith('/categories');
    const sentHeaders = mocks.requestMock.mock.calls[0][0].headers as Record<string, string>;
    expect(sentHeaders['Cache-Control']).toBe('no-cache');
    expect(sentHeaders['Pragma']).toBe('no-cache');
  });

  it('returns { error: { status, data } } on axios HTTP error', async () => {
    const baseQuery = axiosBaseQuery();
    mocks.requestMock.mockRejectedValueOnce(axiosFailure(404, { message: 'Not found' }));

    const result = await baseQuery({ url: '/missing', method: 'GET' }, fakeApi(), {});

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(404);
    expect(result.error!.data).toEqual({ message: 'Not found' });
  });

  it('maps axios network error (no response) to undefined status + message', async () => {
    const baseQuery = axiosBaseQuery();
    mocks.requestMock.mockRejectedValueOnce(axiosFailure(undefined));

    const result = await baseQuery({ url: '/anything', method: 'GET' }, fakeApi(), {});

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBeUndefined();
    expect(result.error!.data).toBe('Network Error');
  });
});

describe('baseQueryWithReauth — mutex', () => {
  it('fires only ONE refresh for concurrent 401s and retries each original request', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());

    mocks.requestMock.mockImplementation((config: { url: string; method?: string }) => {
      // refresh endpoint: succeed once, return new tokens
      if (config.url === '/auth/refresh') {
        return Promise.resolve({
          data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
        });
      }
      // original endpoints: first call for each rejects with 401, retries succeed
      const callCount = mocks.requestMock.mock.calls.filter(
        (c) => (c[0] as { url: string }).url === config.url,
      ).length;
      if (callCount === 1) {
        return Promise.reject(axiosFailure(401));
      }
      return Promise.resolve({ data: { url: config.url, retried: true } });
    });

    const [r1, r2, r3] = await Promise.all([
      baseQuery({ url: '/users/me', method: 'GET' }, fakeApi(), {}),
      baseQuery({ url: '/masters', method: 'GET' }, fakeApi(), {}),
      baseQuery({ url: '/leads', method: 'GET' }, fakeApi(), {}),
    ]);

    const refreshCalls = mocks.requestMock.mock.calls.filter(
      (c) => (c[0] as { url: string }).url === '/auth/refresh',
    );
    expect(refreshCalls).toHaveLength(1);

    expect(r1.data).toEqual({ url: '/users/me', retried: true });
    expect(r2.data).toEqual({ url: '/masters', retried: true });
    expect(r3.data).toEqual({ url: '/leads', retried: true });

    expect(mocks.setTokensMock).toHaveBeenCalledTimes(1);
    expect(mocks.setTokensMock).toHaveBeenCalledWith({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
  });

  it('releases the mutex after refresh so a later 401 can trigger a new refresh', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());

    // First burst
    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockResolvedValueOnce({ data: { accessToken: 'a1', refreshToken: 'r1' } })
      .mockResolvedValueOnce({ data: { ok: 1 } });

    const first = await baseQuery({ url: '/me', method: 'GET' }, fakeApi(), {});
    expect(first.data).toEqual({ ok: 1 });

    // Second burst (should refresh again)
    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockResolvedValueOnce({ data: { accessToken: 'a2', refreshToken: 'r2' } })
      .mockResolvedValueOnce({ data: { ok: 2 } });

    const second = await baseQuery({ url: '/me', method: 'GET' }, fakeApi(), {});
    expect(second.data).toEqual({ ok: 2 });

    const refreshCalls = mocks.requestMock.mock.calls.filter(
      (c) => (c[0] as { url: string }).url === '/auth/refresh',
    );
    expect(refreshCalls).toHaveLength(2);
  });
});

describe('baseQueryWithReauth — 401 on auth endpoints', () => {
  it('clears auth when /auth/refresh itself returns 401 (no retry)', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock.mockRejectedValueOnce(axiosFailure(401));

    const api = fakeApi();
    const result = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      {},
    );

    expect(result.error?.status).toBe(401);
    expect(api.dispatch).toHaveBeenCalledWith({ type: 'auth/clearAuth' });
    expect(mocks.persistRefreshTokenMock).toHaveBeenCalledWith(null);
    expect(mocks.setLogoutFlagMock).toHaveBeenCalled();
    // No second call — no retry
    expect(mocks.requestMock).toHaveBeenCalledTimes(1);
  });

  it('clears auth when /auth/logout returns 401', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock.mockRejectedValueOnce(axiosFailure(401));

    const api = fakeApi();
    await baseQuery({ url: '/auth/logout', method: 'POST' }, api, {});

    expect(api.dispatch).toHaveBeenCalledWith({ type: 'auth/clearAuth' });
    expect(mocks.requestMock).toHaveBeenCalledTimes(1);
  });
});

describe('baseQueryWithReauth — refresh success path', () => {
  it('dispatches setTokens and retries the original request on successful refresh', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());

    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockResolvedValueOnce({
        data: { accessToken: 'fresh-access', refreshToken: 'fresh-refresh' },
      })
      .mockResolvedValueOnce({ data: { user: 'me' } });

    const api = fakeApi();
    const result = await baseQuery({ url: '/users/me', method: 'GET' }, api, {});

    expect(result.data).toEqual({ user: 'me' });
    expect(mocks.setTokensMock).toHaveBeenCalledWith({
      accessToken: 'fresh-access',
      refreshToken: 'fresh-refresh',
    });
    expect(mocks.persistRefreshTokenMock).toHaveBeenCalledWith('fresh-refresh');
  });

  it('unwraps envelope { data: { accessToken, refreshToken } } from refresh response', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());

    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockResolvedValueOnce({
        data: { data: { accessToken: 'env-access', refreshToken: 'env-refresh' } },
      })
      .mockResolvedValueOnce({ data: { ok: true } });

    await baseQuery({ url: '/me', method: 'GET' }, fakeApi(), {});

    expect(mocks.setTokensMock).toHaveBeenCalledWith({
      accessToken: 'env-access',
      refreshToken: 'env-refresh',
    });
  });

  it('keeps old refreshToken when refresh response does not return a new one', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());

    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockResolvedValueOnce({ data: { accessToken: 'only-access' } })
      .mockResolvedValueOnce({ data: { ok: true } });

    await baseQuery(
      { url: '/me', method: 'GET' },
      fakeApi({ accessToken: 'old', refreshToken: 'old-refresh' }),
      {},
    );

    expect(mocks.setTokensMock).toHaveBeenCalledWith({
      accessToken: 'only-access',
      refreshToken: 'old-refresh',
    });
    // Old refresh token preserved → no new persist write
    expect(mocks.persistRefreshTokenMock).not.toHaveBeenCalled();
  });
});

describe('baseQueryWithReauth — refresh failure paths', () => {
  it('clears auth when refresh fails with 401', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockRejectedValueOnce(axiosFailure(401));

    const api = fakeApi();
    const result = await baseQuery({ url: '/me', method: 'GET' }, api, {});

    expect(api.dispatch).toHaveBeenCalledWith({ type: 'auth/clearAuth' });
    expect(mocks.persistRefreshTokenMock).toHaveBeenCalledWith(null);
    expect(mocks.setLogoutFlagMock).toHaveBeenCalled();
    // Original 401 returned — no retry
    expect(result.error?.status).toBe(401);
  });

  it('clears auth when refresh fails with 403', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockRejectedValueOnce(axiosFailure(403));

    const api = fakeApi();
    await baseQuery({ url: '/me', method: 'GET' }, api, {});

    expect(api.dispatch).toHaveBeenCalledWith({ type: 'auth/clearAuth' });
  });

  it('does NOT clear auth when refresh fails with 5xx (keep user logged in on transient errors)', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockRejectedValueOnce(axiosFailure(503));

    const api = fakeApi();
    const result = await baseQuery({ url: '/me', method: 'GET' }, api, {});

    // critical: do not log user out on server errors
    expect(api.dispatch).not.toHaveBeenCalledWith({ type: 'auth/clearAuth' });
    expect(mocks.persistRefreshTokenMock).not.toHaveBeenCalledWith(null);
    // original 401 returned to caller (not retried)
    expect(result.error?.status).toBe(401);
  });

  it('does NOT clear auth when refresh fails with a network error (no status)', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockRejectedValueOnce(axiosFailure(undefined));

    const api = fakeApi();
    await baseQuery({ url: '/me', method: 'GET' }, api, {});

    expect(api.dispatch).not.toHaveBeenCalledWith({ type: 'auth/clearAuth' });
  });
});

describe('baseQueryWithReauth — guard clauses', () => {
  it('clears auth immediately (no refresh call) when there is no refreshToken in non-httpOnly mode', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock.mockRejectedValueOnce(axiosFailure(401));

    const api = fakeApi(null);
    const result = await baseQuery({ url: '/me', method: 'GET' }, api, {});

    expect(api.dispatch).toHaveBeenCalledWith({ type: 'auth/clearAuth' });
    expect(mocks.persistRefreshTokenMock).toHaveBeenCalledWith(null);
    // only the original call — no /auth/refresh attempted
    expect(mocks.requestMock).toHaveBeenCalledTimes(1);
    expect(result.error?.status).toBe(401);
  });

  it('skips refresh attempt when httpOnly mode is on and guest hint is set', async () => {
    mocks.envMock.useHttpOnly = true;
    mocks.isHttpOnlyGuestHintMock.mockReturnValue(true);

    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock.mockRejectedValueOnce(axiosFailure(401));

    const api = fakeApi(null);
    const result = await baseQuery({ url: '/me', method: 'GET' }, api, {});

    // No refresh attempted
    const refreshCalls = mocks.requestMock.mock.calls.filter(
      (c) => (c[0] as { url: string }).url === '/auth/refresh',
    );
    expect(refreshCalls).toHaveLength(0);
    expect(result.error?.status).toBe(401);
  });

  it('in httpOnly mode, refreshes without requiring refreshToken in state', async () => {
    mocks.envMock.useHttpOnly = true;

    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock
      .mockRejectedValueOnce(axiosFailure(401))
      .mockResolvedValueOnce({ data: { accessToken: 'httponly-access' } })
      .mockResolvedValueOnce({ data: { ok: true } });

    const api = fakeApi(null);
    const result = await baseQuery({ url: '/me', method: 'GET' }, api, {});

    expect(result.data).toEqual({ ok: true });
    // Refresh payload should be empty object in httpOnly mode
    const refreshCall = mocks.requestMock.mock.calls.find(
      (c) => (c[0] as { url: string }).url === '/auth/refresh',
    );
    expect(refreshCall?.[0].data).toEqual({});
  });
});

describe('baseQueryWithReauth — error toasts', () => {
  it('shows a toast for 5xx errors', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock.mockRejectedValueOnce(axiosFailure(503, { message: 'overloaded' }));

    await baseQuery({ url: '/anything', method: 'GET' }, fakeApi(), {});

    expect(mocks.toastErrorMock).toHaveBeenCalledTimes(1);
  });

  it('shows a toast for network errors (no status)', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock.mockRejectedValueOnce(axiosFailure(undefined));

    await baseQuery({ url: '/anything', method: 'GET' }, fakeApi(), {});

    expect(mocks.toastErrorMock).toHaveBeenCalledTimes(1);
  });

  it('does NOT show a toast for 4xx errors other than 401', async () => {
    const baseQuery = baseQueryWithReauth(axiosBaseQuery());
    mocks.requestMock.mockRejectedValueOnce(axiosFailure(404));

    await baseQuery({ url: '/missing', method: 'GET' }, fakeApi(), {});

    expect(mocks.toastErrorMock).not.toHaveBeenCalled();
  });
});
