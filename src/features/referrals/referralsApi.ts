import { api } from '@/services/api';
import { unwrapEnvelope } from '@/utils/data';

interface ReferralInfo {
    code: string;
    usageCount: number;
    referrals: Array<{
        id: string;
        status: string;
        rewardGranted: boolean;
        createdAt: string;
        referredUser: {
            firstName: string | null;
            lastName: string | null;
            createdAt: string;
        };
    }>;
    stats: {
        total: number;
        pending: number;
        qualified: number;
        rewarded: number;
    };
}

interface ValidateCodeResponse {
    valid: boolean;
    referrerName?: string;
}

export const referralsApi = api.injectEndpoints({
    endpoints: (build) => ({
        configReferralsEnabled: build.query<{ enabled: boolean }, void>({
            query: () => ({ url: '/config/referrals-enabled', method: 'GET' }),
            transformResponse: (raw: unknown) => {
                const u = unwrapEnvelope(raw);
                return (u && typeof u === 'object' && 'enabled' in u)
                    ? { enabled: !!(u as { enabled: boolean }).enabled }
                    : { enabled: false };
            },
            keepUnusedDataFor: 300, // 5 min - public config changes rarely
        }),

        referralsGetMy: build.query<ReferralInfo, void>({
            query: () => ({ url: '/referrals/my', method: 'GET' }),
            transformResponse: (raw: unknown) => unwrapEnvelope(raw) as ReferralInfo,
            providesTags: ['Referrals'],
            keepUnusedDataFor: 120, // 2 min cache to reduce refetch
        }),

        referralsValidateCode: build.query<ValidateCodeResponse, string>({
            query: (code) => ({ url: `/referrals/validate/${code}`, method: 'GET' }),
        }),

        referralsApplyCode: build.mutation<{ id: string; status: string; rewardGranted: boolean }, { code: string }>({
            query: (body) => ({ url: '/referrals/apply', method: 'POST', data: body }),
            invalidatesTags: ['Referrals'],
        }),
    }),
});

export const {
    useConfigReferralsEnabledQuery,
    useReferralsGetMyQuery,
    useReferralsValidateCodeQuery,
    useReferralsApplyCodeMutation,
} = referralsApi;
