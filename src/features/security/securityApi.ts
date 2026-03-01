import { api } from '@/services/api';

export const securityApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Phone Verification
    phoneVerificationSendCode: build.mutation<unknown, void>({
      query: () => ({ url: '/phone-verification/send-code', method: 'POST' }),
    }),

    phoneVerificationVerify: build.mutation<unknown, { code: string }>({
      query: (body) => ({ url: '/phone-verification/verify', method: 'POST', data: body }),
      invalidatesTags: ['Me'],
    }),

    phoneVerificationStatus: build.query<unknown, void>({
      query: () => ({ url: '/phone-verification/status', method: 'GET' }),
    }),

    securityLoginHistory: build.query<unknown, void>({
      query: () => ({ url: '/security/login-history', method: 'GET' }),
    }),

    changePassword: build.mutation<unknown, { currentPassword: string; newPassword: string }>({
      query: (body) => ({
        url: '/security/change-password',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Me'],
    }),

    // Security Management (Admin)
    securityBanUser: build.mutation<unknown, { userId: string; reason: string }>({
      query: ({ userId, reason }) => ({
        url: `/security/ban-user/${userId}`,
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: ['Users', 'Admin'],
    }),

    securityUnbanUser: build.mutation<unknown, { userId: string }>({
      query: ({ userId }) => ({
        url: `/security/unban-user/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Users', 'Admin'],
    }),

    securityBlacklistIp: build.mutation<
      unknown,
      { ipAddress: string; reason: string; expiresAt?: Date }
    >({
      query: (body) => ({
        url: '/security/blacklist-ip',
        method: 'POST',
        data: body,
      }),
    }),

    securityRemoveIpBlacklist: build.mutation<unknown, { ipAddress: string }>({
      query: ({ ipAddress }) => ({
        url: `/security/remove-ip-blacklist/${ipAddress}`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  usePhoneVerificationSendCodeMutation,
  usePhoneVerificationVerifyMutation,
  usePhoneVerificationStatusQuery,
  useSecurityLoginHistoryQuery,
  useChangePasswordMutation,
  useSecurityBanUserMutation,
  useSecurityUnbanUserMutation,
  useSecurityBlacklistIpMutation,
  useSecurityRemoveIpBlacklistMutation,
} = securityApi;
