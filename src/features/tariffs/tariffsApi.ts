import { api } from '@/services/api';

function unwrap<T>(response: unknown): T {
  const r = response as { data?: T };
  return (r?.data !== undefined ? r.data : response) as T;
}

export interface Tariff {
  id: string;
  name: string;
  type: 'BASIC' | 'VIP' | 'PREMIUM';
  price: string;
  amount: number;
  days: number;
  description?: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTariffDto {
  name: string;
  type: 'BASIC' | 'VIP' | 'PREMIUM';
  price: string;
  amount: number;
  days?: number;
  description?: string;
  features: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateTariffDto = Partial<CreateTariffDto>;

export const tariffsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTariffs: build.query<Tariff[], { isActive?: boolean } | void>({
      query: (params) => ({
        url: '/tariffs',
        method: 'GET',
        params: params ?? {},
      }),
      transformResponse: (response: unknown): Tariff[] => {
        const data = unwrap<Tariff[]>(response);
        const result = Array.isArray(data) ? data : [];
        return result;
      },
      providesTags: ['Tariffs'],
    }),
    getActiveTariffs: build.query<Tariff[], void>({
      query: () => ({ url: '/tariffs/active', method: 'GET' }),
      transformResponse: (response: unknown): Tariff[] => {
        const data = unwrap<Tariff[]>(response);
        const result = Array.isArray(data) ? data : [];
        return result;
      },
      providesTags: ['Tariffs'],
    }),
    getTariff: build.query<Tariff, string>({
      query: (id) => ({ url: `/tariffs/${id}`, method: 'GET' }),
      transformResponse: (response: unknown): Tariff => unwrap<Tariff>(response),
      providesTags: (_result, _error, id) => [{ type: 'Tariffs', id }],
    }),
    createTariff: build.mutation<Tariff, CreateTariffDto>({
      query: (data) => ({ url: '/tariffs', method: 'POST', data }),
      transformResponse: (response: unknown): Tariff => unwrap<Tariff>(response),
      invalidatesTags: ['Tariffs'],
    }),
    updateTariff: build.mutation<Tariff, { id: string; data: UpdateTariffDto }>({
      query: ({ id, data }) => ({ url: `/tariffs/${id}`, method: 'PUT', data }),
      transformResponse: (response: unknown): Tariff => unwrap<Tariff>(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Tariffs', id }, 'Tariffs'],
    }),
    deleteTariff: build.mutation<void, string>({
      query: (id) => ({ url: `/tariffs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Tariffs'],
    }),
  }),
});

export const {
  useGetTariffsQuery,
  useGetActiveTariffsQuery,
  useGetTariffQuery,
  useCreateTariffMutation,
  useUpdateTariffMutation,
  useDeleteTariffMutation,
} = tariffsApi;
