import { api } from '@/services/api';
import { FileDto } from '@/types';

export type MyPhotosResponse = {
  avatarFileId: string | null;
  items: FileDto[];
};

export type OkResponse = { ok: true };

export const masterPhotosApi = api.injectEndpoints({
  endpoints: (build) => ({
    mastersMyPhotos: build.query<MyPhotosResponse, void>({
      query: () => ({ url: '/masters/photos/me', method: 'GET' }),
      providesTags: ['Files', 'Master'],
      transformResponse: (raw: unknown) => {
        const r =
          raw && typeof raw === 'object' && raw !== null && 'data' in raw
            ? (raw as { data?: unknown }).data
            : raw;
        const root = (r && typeof r === 'object' ? r : {}) as {
          avatarFileId?: unknown;
          items?: unknown;
        };
        return {
          avatarFileId: typeof root.avatarFileId === 'string' ? root.avatarFileId : null,
          items: Array.isArray(root.items) ? (root.items as FileDto[]) : [],
        };
      },
    }),

    mastersPhotosById: build.query<MyPhotosResponse, { id: string; limit?: number }>({
      query: ({ id, limit }) => ({ url: `/masters/${id}/photos`, method: 'GET', params: { limit } }),
      transformResponse: (raw: unknown) => {
        const r =
          raw && typeof raw === 'object' && raw !== null && 'data' in raw
            ? (raw as { data?: unknown }).data
            : raw;
        const root = (r && typeof r === 'object' ? r : {}) as {
          avatarFileId?: unknown;
          items?: unknown;
        };
        const items = Array.isArray(root.items) ? (root.items as unknown[]) : [];
        return {
          avatarFileId: typeof root.avatarFileId === 'string' ? root.avatarFileId : null,
          items: items
            .map((x) => {
              const obj = x as { path?: unknown; url?: unknown } & Partial<FileDto>;
              const path =
                typeof obj.path === 'string'
                  ? obj.path
                  : typeof obj.url === 'string'
                    ? obj.url
                    : '';
              return { ...(obj as FileDto), path };
            })
            .filter((x) => typeof x.path === 'string' && x.path.length > 0),
        };
      },
    }),

    mastersSetAvatar: build.mutation<OkResponse, { fileId: string }>( {
      query: (body) => ({ url: '/masters/avatar/me', method: 'PATCH', data: body }),
      invalidatesTags: ['Master', 'Me', 'Files'],
    }),

    mastersRemovePhoto: build.mutation<OkResponse, { fileId: string }>({
      query: ({ fileId }) => ({ url: `/masters/photos/${fileId}`, method: 'DELETE' }),
      invalidatesTags: ['Master', 'Files'],
    }),
  }),
});

export const {
  useMastersMyPhotosQuery,
  useMastersPhotosByIdQuery,
  useMastersSetAvatarMutation,
  useMastersRemovePhotoMutation,
} = masterPhotosApi;
