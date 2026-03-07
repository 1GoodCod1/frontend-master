import { api } from '@/services/api';

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
        }),

        webPushSubscribe: build.mutation<SubscribeResponse, {
            endpoint: string;
            p256dh: string;
            auth: string;
            userAgent?: string;
        }>({
            query: (body) => ({ url: '/web-push/subscribe', method: 'POST', data: body }),
        }),

        webPushUnsubscribe: build.mutation<{ success: boolean }, { endpoint: string }>({
            query: (body) => ({ url: '/web-push/unsubscribe', method: 'DELETE', data: body }),
        }),
    }),
});

export const {
    useGetVapidPublicKeyQuery,
    useWebPushSubscribeMutation,
    useWebPushUnsubscribeMutation,
} = webPushApi;
