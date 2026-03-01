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
    <Card className="h-full overflow-hidden border-border bg-card transition-all hover:shadow-xl">
      <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="group relative mb-8">
          <Avatar
            key={avatarPath ?? 'no-avatar'}
            className={cn(
              "size-48 border-4 border-background transition-all duration-300 group-hover:scale-[1.02]",
              hasAvatar ? "shadow-2xl ring-4 ring-primary/20" : "shadow-xl"
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

        <div className="flex flex-col gap-3 w-full max-w-[200px]">
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
              className="w-full gap-2 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
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
                className="w-full gap-2 border-primary text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground shadow-sm transition-all"
              >
                <Upload className="size-4" />
                {t('clientProfile.changeAvatar', 'Сменить фото')}
              </Button>
              <Button
                variant="outline"
                onClick={handleRemoveClick}
                disabled={removeLoading || !phoneVerified}
                className="w-full gap-2 border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white transition-all shadow-sm"
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
