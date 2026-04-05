import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    useGetVapidPublicKeyQuery,
    useWebPushSubscribeMutation,
    useWebPushUnsubscribeMutation,
} from '@/features/notifications/webPushApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { env } from '@/services/env';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

type AxiosLikeError = { status?: number; data?: unknown };

function messageFromVapidError(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') return undefined;
    const { status, data } = error as AxiosLikeError;
    const d = data;
    if (status === 503) {
        if (typeof d === 'object' && d !== null && 'message' in d) {
            const m = (d as { message: unknown }).message;
            if (typeof m === 'string' && m.trim()) return m;
            if (Array.isArray(m) && typeof m[0] === 'string') return m[0];
        }
        return 'Push на сервере не настроен: задайте VAPID_PUBLIC_KEY и VAPID_PRIVATE_KEY в .env.docker и перезапустите контейнер API.';
    }
    if (status == null || status === 0) {
        return 'Нет ответа от API. Проверьте, что сервер запущен, и VITE_API_URL (должен совпадать с адресом бэкенда).';
    }
    return undefined;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export type PushPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export function useWebPush() {
    const isAuthed = useAppSelector(selectIsAuthed);
    const [permissionState, setPermissionState] = useState<PushPermissionState>('prompt');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { data: vapidData, refetch: refetchVapid } = useGetVapidPublicKeyQuery(undefined, {
        skip: !isAuthed || !('serviceWorker' in navigator),
    });

    const [subscribeMutation] = useWebPushSubscribeMutation();
    const [unsubscribeMutation] = useWebPushUnsubscribeMutation();

    // Check current state
    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setPermissionState('unsupported');
            return;
        }

        setPermissionState(Notification.permission as PushPermissionState);

        // Check existing subscription
        navigator.serviceWorker.ready.then((registration) => {
            registration.pushManager.getSubscription().then((sub) => {
                setIsSubscribed(!!sub);
            });
        });
    }, []);

    const subscribe = useCallback(async () => {
        if (!('serviceWorker' in navigator)) {
            toast.error('Service Worker не поддерживается в этом браузере.');
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        if (!registration.active) {
            toast.error('Service Worker не активен. Попробуйте обновить страницу.');
            return;
        }

        let key = vapidData?.publicKey;
        if (!key) {
            const { data, error } = await refetchVapid();
            key = data?.publicKey;
            if (!key) {
                toast.error(
                    messageFromVapidError(error) ??
                        'Уведомления недоступны. Задайте пару VAPID ключей на сервере (npm run generate:secrets в api-master) и перезапустите API.',
                );
                return;
            }
        }

        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            registration.active?.postMessage({ type: 'SET_API_URL', apiUrl: env.apiUrl });

            // Request permission
            const permission = await Notification.requestPermission();
            setPermissionState(permission as PushPermissionState);

            if (permission !== 'granted') {
                setIsLoading(false);
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(key) as unknown as BufferSource,
            });

            await subscribeMutation({
                endpoint: subscription.endpoint,
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                auth: arrayBufferToBase64(subscription.getKey('auth')),
                userAgent: navigator.userAgent,
            }).unwrap();

            setIsSubscribed(true);
        } catch (error) {
            console.error('Push subscription failed:', error);
            toast.error('Не удалось включить уведомления');
        } finally {
            setIsLoading(false);
        }
    }, [vapidData?.publicKey, subscribeMutation, refetchVapid]);

    const unsubscribe = useCallback(async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await unsubscribeMutation({ endpoint: subscription.endpoint }).unwrap();
                await subscription.unsubscribe();
            }

            setIsSubscribed(false);
        } catch (error) {
            console.error('Push unsubscribe failed:', error);
            toast.error('Не удалось отключить уведомления');
        } finally {
            setIsLoading(false);
        }
    }, [unsubscribeMutation]);

    return {
        permissionState,
        isSubscribed,
        isLoading,
        isSupported: permissionState !== 'unsupported',
        subscribe,
        unsubscribe,
    };
}
