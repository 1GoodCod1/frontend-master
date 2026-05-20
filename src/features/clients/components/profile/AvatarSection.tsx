import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { clientCardStaticCls, clientOutlineBtnCls, clientPrimaryBtnCls } from '@/lib/clientCabinetStyles';

interface AvatarSectionProps {
  avatarUrl: string | null;
  avatarPath: string | undefined;
  avatarFileId: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (fileId: string) => void;
  uploadLoading: boolean;
  removeLoading: boolean;
  phoneVerified: boolean;
}

export default function AvatarSection({
  avatarUrl,
  avatarPath,
  avatarFileId,
  onUpload,
  onRemove,
  uploadLoading,
  removeLoading,
  phoneVerified,
}: AvatarSectionProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasAvatar = Boolean(avatarUrl);

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveClick = () => {
    if (avatarFileId) {
      onRemove(avatarFileId);
    }
  };

  return (
    <div className={cn(clientCardStaticCls, 'h-full')}>
      <CardContent className="relative flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="group/avatar relative mb-8">
          <Avatar
            key={avatarPath ?? 'no-avatar'}
            className={cn(
              'size-48 border-[6px] border-background transition duration-300',
              hasAvatar ? 'shadow-xl ring-4 ring-[#E97525]/20' : 'shadow-lg ring-1 ring-[#E9ECEF] dark:ring-white/10',
            )}
          >
            <AvatarImage src={avatarUrl ?? undefined} alt="Avatar" className="object-cover" />
            <AvatarFallback className="overflow-hidden rounded-full bg-muted p-0">
              <AvatarPlaceholder role="client" height={192} />
            </AvatarFallback>
          </Avatar>

          {uploadLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <Loader2 className="size-8 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex w-full max-w-[200px] flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
            disabled={uploadLoading || !phoneVerified}
          />

          {!hasAvatar ? (
            <Button
              onClick={handleEditClick}
              disabled={uploadLoading || !phoneVerified}
              className={cn(clientPrimaryBtnCls, 'w-full')}
            >
              <Upload className="size-4" />
              {uploadLoading ? t('common.loading') : t('clientProfile.uploadAvatar', 'Загрузить фото')}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleEditClick}
                disabled={uploadLoading || !phoneVerified}
                className={cn(clientOutlineBtnCls, 'w-full')}
              >
                <Upload className="size-4" />
                {t('clientProfile.changeAvatar', 'Сменить фото')}
              </Button>
              <Button
                variant="outline"
                onClick={handleRemoveClick}
                disabled={removeLoading || !phoneVerified}
                className="w-full gap-2 rounded-[14px] border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
              >
                {removeLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                {t('clientProfile.removeAvatar', 'Удалить')}
              </Button>
            </>
          )}

          {!phoneVerified && (
            <p className="mt-2 text-[12px] text-[#6C757D] dark:text-white/50">
              {t('clientProfile.verifyToUpload', 'Верифицируйте номер для фото')}
            </p>
          )}
        </div>
      </CardContent>
    </div>
  );
}
