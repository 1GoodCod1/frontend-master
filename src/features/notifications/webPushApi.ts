import { api } from '@/services/api';
import { unwrapObject } from '@/utils/data';

interface VapidKeyResponse {
    publicKey: string;
}

interface SubscribeResponse {
    success: boolean;
    id: string;
}

export const webPushApi = api.injectEndpoints({
    endpoints: (build) => ({
        getVapidPublicKey: build.query<VapidKeyResponse, void>({
            query: () => ({ url: '/web-push/vapid-public-key', method: 'GET' }),
            transformResponse: (raw: unknown) => unwrapObject<VapidKeyResponse>(raw),
        }),

        webPushSubscribe: build.mutation<SubscribeResponse, {
            endpoint: string;
            p256dh: string;
            auth: string;
            userAgent?: string;
        }>({
            query: (body) => ({ url: '/web-push/subscribe', method: 'POST', data: body }),
            transformResponse: (raw: unknown) => unwrapObject<SubscribeResponse>(raw),
        }),

        webPushUnsubscribe: build.mutation<{ success: boolean }, { endpoint: string }>({
            query: (body) => ({ url: '/web-push/unsubscribe', method: 'DELETE', data: body }),
            transformResponse: (raw: unknown) => unwrapObject<{ success: boolean }>(raw),
        }),
    }),
});

export const {
    useGetVapidPublicKeyQuery,
    useWebPushSubscribeMutation,
    useWebPushUnsubscribeMutation,
} = webPushApi;
