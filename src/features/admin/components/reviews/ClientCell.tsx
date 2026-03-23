import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { mediaUrl } from '@/utils/media';
import type { ReviewDto } from '@/types/reviews';

interface ClientCellProps {
  review: ReviewDto;
}

export default function ClientCell({ review }: ClientCellProps) {
  const clientName = review.clientName || '—';

  const rawPath =
    review.client?.avatarFile?.path ??
    review.client?.clientPhotos?.[0]?.file?.path ??
    null;
  const avatarSrc = rawPath ? mediaUrl(rawPath) : undefined;

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <Avatar className="size-12 rounded-lg shrink-0 overflow-hidden shadow-sm">
        {avatarSrc ? (
          <AvatarImage key={avatarSrc} src={avatarSrc} className="object-cover" alt="" />
        ) : null}
        <AvatarFallback className="rounded-lg p-0 bg-transparent">
          <AvatarPlaceholder role="client" height={48} fillParent />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground truncate">{clientName}</span>
        {review.clientPhone && (
          <span className="text-xs text-muted-foreground truncate block">{review.clientPhone}</span>
        )}
      </div>
    </div>
  );
}
