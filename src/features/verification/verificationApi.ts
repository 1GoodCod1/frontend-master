import { api } from '@/services/api';

export interface SubmitVerificationDto {
  documentType: string;
  documentNumber: string;
  documentFrontId: string;
  documentBackId?: string;
  selfieId?: string;
  phone: string;
}

export interface VerificationStatus {
  isVerified: boolean;
  pendingVerification: boolean;
  verification?: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    documentType: string;
    documentNumber: string;
    phone: string;
    phoneVerified: boolean;
    submittedAt: string;
    reviewedAt?: string;
    notes?: string;
    documentFront?: { id: string; path: string; url?: string };
    documentBack?: { id: string; path: string; url?: string };
    selfie?: { id: string; path: string; url?: string };
  };
}

export interface VerificationStats {
  approvedCount: number;
  first100Limit: number;
}

export interface PendingVerificationsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VerificationDetail {
  id: string;
  masterId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documentType: string;
  documentNumber: string;
  phone: string;
  phoneVerified: boolean;
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
  approvedCount?: number;
  first100Limit?: number;
  willReceivePremium?: boolean;
  nextSlotNumber?: number;
  master: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      phoneVerified: boolean;
    };
    city: { name: string };
    category: { name: string };
  };
  documentFront?: { id: string; path: string; url: string };
  documentBack?: { id: string; path: string; url: string };
  selfie?: { id: string; path: string; url: string };
}

export interface ReviewVerificationDto {
  decision: 'APPROVE' | 'REJECT';
  notes?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapObject<T>(raw: unknown): T {
  if (isRecord(raw) && 'data' in raw) {
    const d = (raw as { data?: T }).data;
    if (d !== undefined) return d;
  }
  return raw as T;
}

export const verificationApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Submit verification request (Master only)
    submitVerification: build.mutation<{ message: string; verificationId: string }, SubmitVerificationDto>({
      query: (body) => ({
        url: '/verification/submit',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Me', 'Verification'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          
          // Сразу делаем реальный запрос для получения обновленных данных
          await dispatch(
            verificationApi.endpoints.getMyVerificationStatus.initiate(undefined, { forceRefetch: true })
          ).unwrap();
        } catch {
          // ignore refetch errors
        }
      },
    }),

    // Get my verification status (Master only)
    getMyVerificationStatus: build.query<VerificationStatus, void>({
      query: () => ({ url: '/verification/my-status', method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<VerificationStatus>(raw),
      providesTags: ['Me', 'Verification'],
    }),

    // Get verification stats — approved count / 100 (Admin only)
    getVerificationStats: build.query<VerificationStats, void>({
      query: () => ({ url: '/verification/stats', method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<VerificationStats>(raw),
      providesTags: ['Admin', 'VerificationStats'],
    }),

    // Get pending verifications (Admin only)
    getPendingVerifications: build.query<
      { verifications: VerificationDetail[]; meta: PendingVerificationsMeta },
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/verification/pending',
        method: 'GET',
        params,
      }),
      transformResponse: (raw: unknown) =>
        unwrapObject<{ verifications: VerificationDetail[]; meta: PendingVerificationsMeta }>(raw),
      providesTags: ['Admin'],
    }),

    // Get verification details (Admin only)
    getVerificationDetails: build.query<VerificationDetail, string>({
      query: (id) => ({ url: `/verification/${id}`, method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<VerificationDetail>(raw),
      providesTags: ['Admin'],
    }),

    // Review verification (Admin only)
    reviewVerification: build.mutation<{ message: string }, { id: string; decision: 'APPROVE' | 'REJECT'; notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/verification/${id}/review`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Admin', 'Me', 'Verification', 'VerificationStats'],
    }),
  }),
});

export const {
  useSubmitVerificationMutation,
  useGetMyVerificationStatusQuery,
  useGetVerificationStatsQuery,
  useGetPendingVerificationsQuery,
  useGetVerificationDetailsQuery,
  useReviewVerificationMutation,
} = verificationApi;
