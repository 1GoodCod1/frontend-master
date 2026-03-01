import { api } from '@/services/api';
import { FileDto } from '@/types';

export type MyPhotosResponse = {
  avatarFileId: string | null;
  items: FileDto[];
};

type OkResponse = { ok: true };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapEnvelope(raw: unknown): unknown {
  if (isRecord(raw) && 'data' in raw) {
    const d = (raw as { data?: unknown }).data;
    return d !== undefined ? d : raw;
  }
  return raw;
}

export const clientPhotosApi = api.injectEndpoints({
  endpoints: (build) => ({
    clientsMyPhotos: build.query<MyPhotosResponse, void>({
      query: () => ({ url: '/users/me/photos', method: 'GET' }),
      providesTags: ['Files', 'Me'],
      transformResponse: (raw: unknown): MyPhotosResponse => {
        const r = unwrapEnvelope(raw);
        const root = isRecord(r) ? r : {};
        return {
          avatarFileId: typeof root.avatarFileId === 'string' ? root.avatarFileId : null,
          items: Array.isArray(root.items) ? (root.items as FileDto[]) : [],
        };
      },
    }),

    clientsRemovePhoto: build.mutation<OkResponse, { fileId: string }>({
      query: ({ fileId }) => ({ url: `/users/me/photos/${fileId}`, method: 'DELETE' }),
      invalidatesTags: ['Me', 'Files'],
    }),
  }),
});

export const {
  useClientsMyPhotosQuery,
  useClientsRemovePhotoMutation,
} = clientPhotosApi;
