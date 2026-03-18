import { api } from '@/services/api';
import type { FileDto } from '@/types';
import { unwrapEnvelope } from '@/utils/data';

export type UploadManyResponse = { items: FileDto[] };

export const filesApi = api.injectEndpoints({
  endpoints: (build) => ({
    filesUpload: build.mutation<FileDto, { file: File }>({
      query: ({ file }) => {
        const fd = new FormData();
        fd.append('file', file);
        return { 
          url: '/files/upload', 
          method: 'POST', 
          data: fd,
        };
      },
      invalidatesTags: ['Files', 'Me'],
    }),
    filesUploadMany: build.mutation<
      UploadManyResponse,
      { files: File[]; forLead?: boolean }
    >({
      query: ({ files, forLead }) => {
        const fd = new FormData();
        files.forEach((f) => fd.append('files', f));
        const url =
          forLead === true
            ? '/files/upload-many?forLead=true'
            : '/files/upload-many';
        return {
          url,
          method: 'POST',
          data: fd,
        };
      },
      transformResponse: (raw: unknown): UploadManyResponse => {
        const inner = unwrapEnvelope(raw);
        const obj = inner && typeof inner === 'object' ? (inner as Record<string, unknown>) : {};
        const items = Array.isArray(obj.items) ? obj.items : [];
        return { items: items as FileDto[] };
      },
      invalidatesTags: ['Files'],
    }),
  }),
});

export const { useFilesUploadMutation, useFilesUploadManyMutation } = filesApi;
