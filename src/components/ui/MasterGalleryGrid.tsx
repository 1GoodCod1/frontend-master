import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle, Trash2 } from 'lucide-react';
import { FileDto } from '@/types';
import { mediaUrl } from '@/utils/media';

export function MasterGalleryGrid({
  items,
  avatarFileId,
  onSetAvatar,
  onRemove,
  busyId,
  max = 15,
}: {
  items: FileDto[];
  avatarFileId: string | null;
  onSetAvatar: (fileId: string) => void;
  onRemove: (fileId: string) => void;
  busyId?: string | null;
  max?: number;
}) {
  const list = Array.isArray(items) ? items.slice(0, max) : [];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {list.map((f) => {
          const isAvatar = avatarFileId && f.id === avatarFileId;
          const isBusy = busyId === f.id;
          const pathOrUrl = (f as FileDto & { path?: string }).path ?? (f as FileDto & { url?: string }).url;
          const url = pathOrUrl ? (pathOrUrl.startsWith('http') ? pathOrUrl : mediaUrl(pathOrUrl)) : '';

          return (
            <Card key={f.id} className="overflow-hidden border-border">
              <div
                role="button"
                tabIndex={0}
                onClick={() => !isBusy && window.open(url, '_blank')}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isBusy) {
                    e.preventDefault();
                    window.open(url, '_blank');
                  }
                }}
                className={`relative cursor-pointer ${isBusy ? 'pointer-events-none cursor-default' : ''}`}
              >
                <img
                  src={url}
                  alt={f.filename}
                  className="h-44 w-full object-cover"
                />

                {isAvatar && (
                  <div className="absolute left-2 top-2">
                    <Badge variant="default" className="bg-emerald-600 text-xs">
                      Avatar
                    </Badge>
                  </div>
                )}

                <div className="absolute right-2 top-2 flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="size-8 border border-border bg-background shadow"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSetAvatar(f.id);
                        }}
                        disabled={isBusy}
                      >
                        <CheckCircle className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Set as avatar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="size-8 border border-border bg-background shadow"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemove(f.id);
                        }}
                        disabled={isBusy}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove from gallery</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <CardContent className="space-y-0.5 py-3">
                <p className="truncate text-sm font-bold" title={f.filename}>
                  {f.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {f.size ? `${Math.round(f.size / 1024)} KB` : '—'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
