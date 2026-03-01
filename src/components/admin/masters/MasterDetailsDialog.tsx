import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, CheckCircle, LayoutGrid, MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StarRatingDisplay } from '@/components/admin/common/StarRatingDisplay';
import { mediaUrl } from '@/utils/media';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';

type MasterDetailsMaster = {
  id: string;
  avatarUrl?: string | null;
  avatarFile?: { path?: string | null } | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  tariffType?: string | null;
  tariff?: string | null;
  plan?: string | null;
  avgRating?: number | null;
  rating?: number | null;
  isFeatured?: boolean | null;
  isVerified?: boolean | null;
  reviewCount?: number | null;
  views?: number | null;
  experienceYears?: number | null;
  description?: string | null;
  user?: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarFile?: { path?: string | null } | null;
    isVerified?: boolean | null;
  } | null;
  city?: ({ name?: string | null } & Record<string, unknown>) | null;
  category?: ({ name?: string | null } & Record<string, unknown>) | null;
} & Record<string, unknown>;

interface MasterDetailsDialogProps {
  open: boolean;
  master: MasterDetailsMaster | null;
  isLoading: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MasterDetailsDialog({
  open,
  master,
  isLoading,
  onClose,
  onUpdate,
}: MasterDetailsDialogProps) {
  const { t } = useTranslation();
  if (!master) return null;

  const avatarPath = master.avatarFile?.path || master.user?.avatarFile?.path;
  const avatarUrl = avatarPath ? mediaUrl(avatarPath) : master.avatarUrl;
  const tariff = master?.tariffType ?? master?.tariff ?? master?.plan ?? 'BASIC';
  const tariffUpper = String(tariff).toUpperCase();
  const rating = master.avgRating ?? master.rating;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md sm:max-w-lg md:max-w-2xl gap-0 p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Master Details</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-4">
          <div
            className="flex items-center gap-4 pb-4 border-b animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75 fill-mode-backwards"
          >
            <Avatar className="size-20 rounded-lg border-2 border-border bg-gradient-to-br from-primary to-primary/80 text-2xl font-semibold shadow-md">
              <AvatarImage src={avatarUrl ?? undefined} className="object-cover" />
              <AvatarFallback>{master.user?.firstName?.[0]?.toUpperCase() || 'M'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-lg font-semibold text-foreground truncate">
                {`${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim() || master.fullName || '—'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {master.user?.email || master.email || '—'}
              </p>
              <div className="flex flex-wrap gap-1.5 items-center">
                <Badge
                  variant={tariffUpper === 'BASIC' ? 'secondary' : 'default'}
                  className="font-semibold"
                >
                  {tariffUpper}
                </Badge>
                {(master.user?.isVerified || master.isVerified) && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1">
                    <CheckCircle className="size-4" />
                    Verified
                  </Badge>
                )}
                {master.isFeatured && (
                  <Badge variant="destructive" className="gap-1">
                    <Star className="size-4" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {master.category && (
              <div
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 fill-mode-backwards"
              >
                <div className="flex items-center gap-2 mb-1">
                  <LayoutGrid className="size-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Category</p>
                </div>
                <p className="text-sm text-muted-foreground ml-7">{getTranslatedCategoryName(t, master.category)}</p>
              </div>
            )}
            {master.city && (
              <div
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 fill-mode-backwards"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="size-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">City</p>
                </div>
                <p className="text-sm text-muted-foreground ml-7">{getTranslatedCityName(t, master.city)}</p>
              </div>
            )}
            {master.phone && (
              <div
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-backwards"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="size-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Phone</p>
                </div>
                <p className="text-sm text-muted-foreground ml-7">{master.phone}</p>
              </div>
            )}
            {(master.user?.email || master.email) && (
              <div
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-backwards"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="size-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Email</p>
                </div>
                <p className="text-sm text-muted-foreground ml-7 truncate">
                  {master.user?.email || master.email}
                </p>
              </div>
            )}
          </div>

          <div
            className="rounded-xl border bg-muted/30 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards"
          >
            <p className="text-sm font-semibold text-foreground mb-3">Statistics</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Rating</p>
                {rating != null ? (
                  <div className="flex items-center gap-1">
                    <StarRatingDisplay value={Number(rating)} size="sm" />
                    <span className="font-semibold">{(Number(rating)).toFixed(1)}</span>
                  </div>
                ) : (
                  <p className="font-medium">No reviews</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Reviews</p>
                <p className="font-semibold">{master.reviewCount ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Views</p>
                <p className="font-semibold">{(master.views ?? 0).toLocaleString()}</p>
              </div>
              {master.experienceYears !== undefined && (
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Experience</p>
                  <p className="font-semibold">
                    {master.experienceYears} {master.experienceYears === 1 ? 'year' : 'years'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {master.description && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300 fill-mode-backwards">
              <p className="text-sm font-semibold text-foreground mb-1">Description</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{master.description}</p>
            </div>
          )}
        </div>
        <Separator />
        <DialogFooter className="px-6 py-4 gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button disabled={isLoading} onClick={onUpdate}>
            {isLoading ? 'Updating...' : 'Update Master'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
