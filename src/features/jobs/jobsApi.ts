import { api } from '@/services/api';
import { unwrapObject } from '@/utils/data';
import type {
  CreateJobApplicationDto,
  CreateJobDto,
  JobApplicationDto,
  JobApplicationsResponse,
  JobDto,
  JobsListResponse,
} from '@/types';

export const jobsApi = api.injectEndpoints({
  endpoints: (build) => ({
    jobsCreate: build.mutation<JobDto, CreateJobDto>({
      query: (body) => ({ url: '/jobs', method: 'POST', data: body }),
      invalidatesTags: ['Jobs'],
      transformResponse: (raw: unknown) => unwrapObject<JobDto>(raw) as JobDto,
    }),

    jobsList: build.query<
      JobsListResponse,
      { status?: string; type?: string; cityId?: string; recommended?: boolean; page?: number; limit?: number; search?: string; sort?: 'recent' | 'best' } | void
    >({
      query: (params) => ({ url: '/jobs', method: 'GET', params: params ?? {} }),
      providesTags: ['Jobs'],
      transformResponse: (raw: unknown) => {
        const obj = unwrapObject<JobsListResponse>(raw);
        return obj ?? { items: [], total: 0, page: 1, limit: 20 };
      },
    }),

    jobById: build.query<JobDto | null, { id: string }>({
      query: ({ id }) => ({ url: `/jobs/${id}`, method: 'GET' }),
      providesTags: (_r, _e, a) => [{ type: 'Jobs', id: a.id }],
      transformResponse: (raw: unknown) => unwrapObject<JobDto>(raw) as JobDto ?? null,
    }),

    jobWithApplications: build.query<JobApplicationsResponse, { id: string }>({
      query: ({ id }) => ({ url: `/jobs/${id}/applications`, method: 'GET' }),
      providesTags: (_r, _e, a) => [
        { type: 'Jobs', id: a.id },
        { type: 'JobApplications', id: a.id },
      ],
      transformResponse: (raw: unknown) =>
        unwrapObject<JobApplicationsResponse>(raw) as JobApplicationsResponse,
    }),

    jobApply: build.mutation<JobApplicationDto, { jobId: string; body: CreateJobApplicationDto }>({
      query: ({ jobId, body }) => ({
        url: `/jobs/${jobId}/apply`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['JobApplications', 'Joints', 'Jobs'],
      transformResponse: (raw: unknown) =>
        unwrapObject<JobApplicationDto>(raw) as JobApplicationDto,
    }),

    jobViewApplication: build.mutation<JobApplicationDto, { applicationId: string }>({
      query: ({ applicationId }) => ({
        url: `/jobs/applications/${applicationId}/view`,
        method: 'PATCH',
      }),
      invalidatesTags: ['JobApplications'],
      transformResponse: (raw: unknown) =>
        unwrapObject<JobApplicationDto>(raw) as JobApplicationDto,
    }),

    jobSelectMaster: build.mutation<{ success: boolean; masterId?: string; masterUserId?: string }, { jobId: string; applicationId: string }>({
      query: ({ jobId, applicationId }) => ({
        url: `/jobs/${jobId}/select/${applicationId}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: 'Jobs', id: a.jobId },
        { type: 'JobApplications', id: a.jobId },
        'JobApplications',
      ],
      transformResponse: (raw: unknown) =>
        (unwrapObject<{ success: boolean; masterId?: string; masterUserId?: string }>(raw) ?? { success: true }),
    }),

    jobRejectApplication: build.mutation<{ success: boolean }, { applicationId: string }>({
      query: ({ applicationId }) => ({
        url: `/jobs/applications/${applicationId}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: ['JobApplications'],
      transformResponse: (raw: unknown) =>
        (unwrapObject<{ success: boolean }>(raw) ?? { success: true }),
    }),

    jobUpdateApplication: build.mutation<JobApplicationDto, { applicationId: string; body: import('@/types').UpdateJobApplicationDto }>({
      query: ({ applicationId, body }) => ({
        url: `/jobs/applications/${applicationId}`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['JobApplications'],
      transformResponse: (raw: unknown) => unwrapObject<JobApplicationDto>(raw) as JobApplicationDto,
    }),

    jobWithdrawApplication: build.mutation<{ success: boolean }, { applicationId: string }>({
      query: ({ applicationId }) => ({
        url: `/jobs/applications/${applicationId}/withdraw`,
        method: 'DELETE',
      }),
      invalidatesTags: ['JobApplications', 'Joints'],
      transformResponse: (raw: unknown) =>
        (unwrapObject<{ success: boolean }>(raw) ?? { success: true }),
    }),

    jobCloseDirect: build.mutation<JobDto, { jobId: string }>({
      query: ({ jobId }) => ({ url: `/jobs/${jobId}/close`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, a) => [{ type: 'Jobs', id: a.jobId }, 'Jobs'],
      transformResponse: (raw: unknown) => unwrapObject<JobDto>(raw) as JobDto,
    }),

    jobRequestClose: build.mutation<JobDto, { jobId: string }>({
      query: ({ jobId }) => ({ url: `/jobs/${jobId}/request-close`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, a) => [{ type: 'Jobs', id: a.jobId }, 'Jobs'],
      transformResponse: (raw: unknown) => unwrapObject<JobDto>(raw) as JobDto,
    }),

    jobConfirmClose: build.mutation<JobDto, { jobId: string }>({
      query: ({ jobId }) => ({ url: `/jobs/${jobId}/confirm-close`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, a) => [{ type: 'Jobs', id: a.jobId }, 'Jobs', 'JobApplications'],
      transformResponse: (raw: unknown) => unwrapObject<JobDto>(raw) as JobDto,
    }),

    jobRejectClose: build.mutation<JobDto, { jobId: string }>({
      query: ({ jobId }) => ({ url: `/jobs/${jobId}/reject-close`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, a) => [{ type: 'Jobs', id: a.jobId }, 'Jobs', 'JobApplications'],
      transformResponse: (raw: unknown) => unwrapObject<JobDto>(raw) as JobDto,
    }),

    jobLeaderboard: build.query<
      { minJoints: number; leaderboard: { rank: number; jointsSpent: number; timeAgo: string }[] },
      { id: string }
    >({
      query: ({ id }) => ({ url: `/jobs/${id}/leaderboard`, method: 'GET' }),
      transformResponse: (raw: unknown) =>
        unwrapObject<{ minJoints: number; leaderboard: { rank: number; jointsSpent: number; timeAgo: string }[] }>(raw) ??
        { minJoints: 1, leaderboard: [] },
    }),

    masterMyApplications: build.query<
      { items: JobApplicationDto[]; total: number; page: number; limit: number },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/jobs/my-applications',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: ['JobApplications'],
      transformResponse: (raw: unknown) => {
        const obj = unwrapObject<{
          items?: JobApplicationDto[];
          total?: number;
          page?: number;
          limit?: number;
        }>(raw);
        return {
          items: obj?.items ?? [],
          total: obj?.total ?? 0,
          page: obj?.page ?? 1,
          limit: obj?.limit ?? 20,
        };
      },
    }),
  }),
});

export const {
  useJobsCreateMutation,
  useJobCloseDirectMutation,
  useJobRequestCloseMutation,
  useJobConfirmCloseMutation,
  useJobRejectCloseMutation,
  useJobsListQuery,
  useJobByIdQuery,
  useJobWithApplicationsQuery,
  useJobApplyMutation,
  useJobUpdateApplicationMutation,
  useJobViewApplicationMutation,
  useJobSelectMasterMutation,
  useJobRejectApplicationMutation,
  useJobWithdrawApplicationMutation,
  useJobLeaderboardQuery,
  useMasterMyApplicationsQuery,
} = jobsApi;
