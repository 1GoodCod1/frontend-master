import { api } from '@/services/api';

export type ConsentType =
  | 'VERIFICATION_DATA_PROCESSING'
  | 'PRIVACY_POLICY'
  | 'TERMS_OF_SERVICE'
  | 'MARKETING';

export interface UserConsent {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  version: string;
  revokedAt: string | null;
  createdAt: string;
}

export interface GrantConsentDto {
  consentType: ConsentType;
  version?: string;
}

export const consentApi = api.injectEndpoints({
  endpoints: (build) => ({
    grantConsent: build.mutation<
      { message: string; consentId: string },
      GrantConsentDto
    >({
      query: (body) => ({
        url: '/consent/grant',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Me'],
    }),

    revokeConsent: build.mutation<{ message: string }, GrantConsentDto>({
      query: (body) => ({
        url: '/consent/revoke',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Me'],
    }),

    getMyConsents: build.query<UserConsent[], void>({
      query: () => ({ url: '/consent/my', method: 'GET' }),
      providesTags: ['Me'],
    }),
  }),
});

export const {
  useGrantConsentMutation,
  useRevokeConsentMutation,
  useGetMyConsentsQuery,
} = consentApi;
