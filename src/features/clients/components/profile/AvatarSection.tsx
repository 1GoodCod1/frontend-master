import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <Card className="group h-full overflow-hidden rounded-2xl border border-black/5 bg-card shadow-sm transition duration-300 hover:border-amber-500/30 hover:shadow-md dark:border-white/5 dark:bg-card/40 dark:hover:border-amber-500/30">
      <CardContent className="relative flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:from-amber-500/5 group-hover:to-transparent group-hover:opacity-100 pointer-events-none" />
        <div className="group/avatar relative mb-8 z-10">
          <Avatar
            key={avatarPath ?? 'no-avatar'}
            className={cn(
              "size-48 border-[6px] border-background transition duration-500 group-hover/avatar:scale-105",
              hasAvatar ? "shadow-2xl ring-4 ring-amber-500/20" : "shadow-xl ring-1 ring-black/5 dark:ring-white/5"
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

        <div className="flex flex-col gap-3 w-full max-w-[200px] relative z-10">
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
              className="w-full gap-2 rounded-xl bg-amber-600 text-white shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-600 dark:hover:bg-amber-700 transition font-semibold"
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
                className="w-full gap-2 rounded-xl border-amber-500/30 text-amber-600 bg-amber-500/5 hover:bg-amber-600 hover:text-white shadow-sm transition font-semibold"
              >
                <Upload className="size-4" />
                {t('clientProfile.changeAvatar', 'Сменить фото')}
              </Button>
              <Button
                variant="outline"
                onClick={handleRemoveClick}
                disabled={removeLoading || !phoneVerified}
                className="w-full gap-2 rounded-xl border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white transition shadow-sm font-semibold"
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
            <p className="mt-2 text-xs text-muted-foreground animate-pulse">
              {t('clientProfile.verifyToUpload', 'Верифицируйте номер для фото')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
