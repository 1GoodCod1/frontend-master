import { api } from '@/services/api';
import type { 
  Idea, 
  CreateIdeaDto, 
  UpdateIdeaStatusDto, 
  QueryIdeasDto,
  IdeasResponse,
} from '@/types/ideas';

export const ideasApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Получить список идей
    ideasList: build.query<IdeasResponse, QueryIdeasDto | void>({
      query: (params) => ({ 
        url: '/ideas', 
        method: 'GET', 
        params: params ?? {} 
      }),
      providesTags: (result) =>
        result?.ideas
          ? [
              ...result.ideas.map(({ id }) => ({ type: 'Ideas' as const, id })),
              { type: 'Ideas', id: 'LIST' },
            ]
          : [{ type: 'Ideas', id: 'LIST' }],
    }),

    // Получить одну идею
    ideaById: build.query<Idea, string>({
      query: (id) => ({ url: `/ideas/${id}`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'Ideas', id }],
    }),

    // Создать идею
    ideaCreate: build.mutation<Idea, CreateIdeaDto>({
      query: (body) => ({ url: '/ideas', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Ideas', id: 'LIST' }],
    }),

    // Обновить статус идеи (только админ)
    ideaUpdateStatus: build.mutation<Idea, { id: string; body: UpdateIdeaStatusDto }>({
      query: ({ id, body }) => ({ 
        url: `/ideas/${id}/status`, 
        method: 'PATCH', 
        data: body 
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Ideas', id },
        { type: 'Ideas', id: 'LIST' },
      ],
    }),

    // Проголосовать / убрать голос
    ideaToggleVote: build.mutation<{ voted: boolean }, string>({
      query: (id) => ({ url: `/ideas/${id}/vote`, method: 'POST' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Оптимистично обновляем кеш
          dispatch(
            ideasApi.util.updateQueryData('ideaById', id, (draft) => {
              draft.hasVoted = data.voted;
              draft.votesCount += data.voted ? 1 : -1;
            })
          );

          // Обновляем в списке
          dispatch(
            ideasApi.util.updateQueryData('ideasList', undefined, (draft) => {
              const idea = draft.ideas.find((i) => i.id === id);
              if (idea) {
                idea.hasVoted = data.voted;
                idea.votesCount += data.voted ? 1 : -1;
              }
            })
          );
        } catch {
          // ignore optimistic update rollback
        }
      },
    }),

    // Удалить идею
    ideaDelete: build.mutation<void, string>({
      query: (id) => ({ url: `/ideas/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Ideas', id: 'LIST' }],
    }),
  }),
});

export const {
  useIdeasListQuery,
  useIdeaByIdQuery,
  useIdeaCreateMutation,
  useIdeaUpdateStatusMutation,
  useIdeaToggleVoteMutation,
  useIdeaDeleteMutation,
} = ideasApi;
