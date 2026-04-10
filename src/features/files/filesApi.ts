import { api } from '@/services/api';
import type { FileDto } from '@/types';
import { unwrapEnvelope } from '@/utils/data';
import { compressImage, compressImages } from '@/utils/compressImage';

export type UploadManyResponse = { items: FileDto[] };

export const filesApi = api.injectEndpoints({
  endpoints: (build) => ({
    filesUpload: build.mutation<FileDto, { file: File }>({
      async queryFn({ file }, _api, _extra, baseQuery) {
        const compressed = await compressImage(file);
        const fd = new FormData();
        fd.append('file', compressed);
        const result = await baseQuery({ url: '/files/upload', method: 'POST', data: fd });
        if (result.error) return { error: result.error };
        return { data: result.data as FileDto };
      },
      invalidatesTags: ['Files', 'Me'],
    }),
    filesUploadMany: build.mutation<
      UploadManyResponse,
      { files: File[]; forLead?: boolean }
    >({
      async queryFn({ files, forLead }, _api, _extra, baseQuery) {
        const compressed = await compressImages(files);
        const fd = new FormData();
        compressed.forEach((f) => fd.append('files', f));
        const url =
          forLead === true
            ? '/files/upload-many?forLead=true'
            : '/files/upload-many';
        const result = await baseQuery({ url, method: 'POST', data: fd });
        if (result.error) return { error: result.error };
        const inner = unwrapEnvelope(result.data);
        const obj = inner && typeof inner === 'object' ? (inner as Record<string, unknown>) : {};
        const items = Array.isArray(obj.items) ? obj.items : [];
        return { data: { items: items as FileDto[] } };
      },
      invalidatesTags: ['Files'],
    }),
  }),
});

export const { useFilesUploadMutation, useFilesUploadManyMutation } = filesApi;
