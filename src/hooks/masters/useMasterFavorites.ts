import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    useFavoritesAddMutation,
    useFavoritesRemoveMutation,
    useFavoritesCheckQuery
} from '@/features/favorites/favoritesApi';
import { toErrorMessage } from '@/utils/errors';

export function useMasterFavorites(masterId: string | undefined, isClient: boolean) {
    const { t } = useTranslation();
    const [favoriteAnimation, setFavoriteAnimation] = useState(false);
    const [localFavoriteState, setLocalFavoriteState] = useState<boolean | null>(null);
    const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const favoriteCheck = useFavoritesCheckQuery(
        { masterId: masterId! },
        { skip: !isClient || !masterId }
    );

    const [addFavorite] = useFavoritesAddMutation();
    const [removeFavorite] = useFavoritesRemoveMutation();

    const isFavorite = localFavoriteState !== null
        ? localFavoriteState
        : (favoriteCheck.data?.isFavorite ?? false);

    useEffect(() => {
        if (favoriteCheck.data?.isFavorite !== undefined) {
            queueMicrotask(() => setLocalFavoriteState(null));
        }
    }, [favoriteCheck.data?.isFavorite]);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        };
    }, []);

    const toggleFavorite = async () => {
        if (!isClient || !masterId) {
            toast.error(t('favorites.loginRequired'));
            return;
        }

        const newFavoriteState = !isFavorite;
        setLocalFavoriteState(newFavoriteState);

        if (newFavoriteState) {
            setFavoriteAnimation(true);
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
            animationTimeoutRef.current = setTimeout(() => setFavoriteAnimation(false), 600);
        }

        try {
            if (isFavorite) {
                await removeFavorite({ masterId }).unwrap();
                toast.success(t('favorites.removed'));
            } else {
                await addFavorite({ masterId }).unwrap();
                toast.success(t('favorites.added'));
            }
        } catch (error: unknown) {
            setLocalFavoriteState(!newFavoriteState);
            setFavoriteAnimation(false);
            toast.error(toErrorMessage(error) ?? t('favorites.error'));
        }
    };

    return {
        isFavorite,
        toggleFavorite,
        favoriteAnimation,
        isLoading: favoriteCheck.isLoading,
    };
}
