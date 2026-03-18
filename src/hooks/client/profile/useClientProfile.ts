import React from 'react';
import { useAuthMeQuery } from '@/features/auth/authApi';
import { usePhoneVerificationStatusQuery } from '@/features/security/securityApi';
import { useFilesUploadMutation } from '@/features/files/filesApi';
import { useUsersSetAvatarMutation } from '@/features/users/usersApi';
import { useClientsMyPhotosQuery, useClientsRemovePhotoMutation } from '@/features/clients/clientPhotosApi';
import { mediaUrl } from '@/utils/media';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { toErrorMessage } from '@/utils/errors';
import { isRecord } from '@/utils/guards';

const CLIENT_PHOTO_LIMIT = 1;

export function useClientProfile() {
  const { t } = useTranslation();
  const me = useAuthMeQuery();
  const statusQuery = usePhoneVerificationStatusQuery(undefined, { skip: !me.isSuccess });
  const [upload, uploadState] = useFilesUploadMutation();
  const [setAvatar, setAvatarState] = useUsersSetAvatarMutation();
  const photos = useClientsMyPhotosQuery();
  const [removePhoto, removePhotoState] = useClientsRemovePhotoMutation();

  const rawMe = me.data;
  const dataMe = isRecord(rawMe) && 'data' in rawMe ? rawMe.data : rawMe;
  const user = isRecord(dataMe) && 'user' in dataMe && isRecord(dataMe.user) ? dataMe.user : dataMe;

  const statusRaw = statusQuery.data;
  const statusVerified =
    (isRecord(statusRaw) &&
      typeof statusRaw.phoneVerified === 'boolean' &&
      statusRaw.phoneVerified) ||
    (isRecord(statusRaw) &&
      isRecord(statusRaw.data) &&
      typeof statusRaw.data.phoneVerified === 'boolean' &&
      statusRaw.data.phoneVerified) ||
    false;

  const phoneVerified = !!(isRecord(user) && user.phoneVerified === true) || statusVerified;
  const isVerified = Boolean(isRecord(user) && user.isVerified === true);

  // Достаем аватар из двух источников: из профиля пользователя или из списка фото по avatarFileId
  const avatarFileFromUser = isRecord(user) && isRecord(user.avatarFile) ? user.avatarFile : null;
  const avatarFileId = (avatarFileFromUser?.id as string) || photos.data?.avatarFileId || null;

  const photoItems = Array.isArray(photos.data?.items) ? photos.data.items : [];

  type PhotoItem = { id?: string; path?: string };
  const avatarFile = avatarFileFromUser ?? (photoItems.find((p: PhotoItem) => p.id === avatarFileId) ?? null);
  const avatarPath = typeof avatarFile?.path === 'string' ? avatarFile.path : undefined;
  const avatarUrl = avatarPath ? mediaUrl(avatarPath) : null;

  const reachedLimit = photoItems.length >= CLIENT_PHOTO_LIMIT;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!phoneVerified) {
      toast.error(t('clientProfile.uploadDisabledVerification'));
      e.target.value = '';
      return;
    }
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error(t('clientProfile.invalidFileType'));
      e.target.value = '';
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('clientProfile.fileTooLarge'));
      e.target.value = '';
      return;
    }



    try {
      // 1. Capture old ID BEFORE doing anything
      const oldFileId = avatarFileId;
      const oldPhotos = [...photoItems];

      // 2. Upload NEW file
      const uploadResult = (await upload({ file }).unwrap()) as { id?: string; data?: { id?: string } };
      const newFileId = uploadResult?.id ?? uploadResult?.data?.id;

      if (!newFileId) {
        throw new Error('Failed to get ID from upload result');
      }

      // 3. Set as avatar IMMEDIATELY
      await setAvatar({ fileId: String(newFileId) }).unwrap();

      // 4. Force refetch to update UI ASAP
      await me.refetch();
      await photos.refetch();

      toast.success(t('clientProfile.avatarUpdated'));

      // 5. CLEANUP OLD PHOTOS (only if they are NOT the new one)
      // We remove the old avatar and any other leftover photos to keep it strictly 1-photo system
      const filesToRemove = oldPhotos.map((p: PhotoItem) => p.id).filter((id): id is string => Boolean(id) && id !== newFileId);
      if (oldFileId && !filesToRemove.includes(oldFileId) && oldFileId !== newFileId) {
        filesToRemove.push(oldFileId);
      }

      for (const idToRemove of filesToRemove) {
        try {
          await removePhoto({ fileId: String(idToRemove) }).unwrap();
        } catch {
          console.warn('Cleanup failed for id:', idToRemove);
        }
      }

      // Final refetch after cleanup
      await photos.refetch();
    } catch (err: unknown) {
      console.error('Avatar update error:', err);
      toast.error(toErrorMessage(err) ?? t('clientProfile.uploadFailed'));
    } finally {
      e.target.value = '';
    }
  };

  const handleSetAvatar = async (fileId: string) => {
    try {
      await setAvatar({ fileId }).unwrap();
      toast.success(t('clientProfile.avatarUpdated'));
      await photos.refetch();
      await me.refetch();
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? t('clientProfile.failedToSetAvatar'));
    }
  };

  const handleRemovePhoto = async (fileId: string) => {
    try {
      await removePhoto({ fileId }).unwrap();
      toast.success(t('clientProfile.photoRemoved'));
      await photos.refetch();
      // Если удалили аватар, обновляем данные пользователя
      if (fileId === avatarFileId) {
        await me.refetch();
      }
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? t('clientProfile.failedToRemovePhoto'));
    }
  };

  const handlePhoneVerified = () => {
    toast.success(t('clientProfile.phoneVerifiedSuccess'));
    me.refetch();
    statusQuery.refetch();
  };

  const handlePhoneAlreadyVerified = () => {
    me.refetch();
    statusQuery.refetch();
  };

  return {
    user,
    phoneVerified,
    isVerified,
    avatarUrl,
    avatarPath,
    avatarFileId,
    photoItems,
    reachedLimit,
    photoLimit: CLIENT_PHOTO_LIMIT,
    isLoading: me.isLoading,
    isError: me.isError,
    error: me.error,
    refetch: me.refetch,
    photosLoading: photos.isLoading,
    photosError: photos.error,
    photosRefetch: photos.refetch,
    uploadLoading: uploadState.isLoading,
    setAvatarLoading: setAvatarState.isLoading,
    removePhotoLoading: removePhotoState.isLoading,
    busyFileId: (setAvatarState.isLoading ? setAvatarState.originalArgs?.fileId : null) ??
      (removePhotoState.isLoading ? removePhotoState.originalArgs?.fileId : null) ??
      null,
    handleFileUpload,
    handleSetAvatar,
    handleRemovePhoto,
    handlePhoneVerified,
    handlePhoneAlreadyVerified,
  };
}
