import { api } from '@/services/api';

function unwrapEnvelope(raw: unknown): unknown {
    if (raw && typeof raw === 'object' && 'data' in raw) {
        return (raw as { data: unknown }).data;
    }
    return raw;
}

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
    useReferralsGetMyQuery,
    useReferralsValidateCodeQuery,
    useReferralsApplyCodeMutation,
} = referralsApi;
