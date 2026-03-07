import { CheckCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type AdminUserActionsRow = {
  id: string;
  isVerified?: boolean | null;
  isBanned?: boolean | null;
} & Record<string, unknown>;

interface ActionsCellProps {
  user: AdminUserActionsRow;
  onVerify: (user: AdminUserActionsRow) => void;
  onBan: (user: AdminUserActionsRow) => void;
}

export default function ActionsCell({ user, onVerify, onBan }: ActionsCellProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={
                user.isVerified
                  ? 'border-0 text-emerald-600 bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30'
                  : 'border-0 text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:hover:bg-amber-500/30'
              }
              onClick={(e) => {
                e.stopPropagation();
                onVerify(user);
              }}
            >
              <CheckCircle className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{user.isVerified ? 'Unverify user' : 'Verify user'}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={
                user.isBanned
                  ? 'border-0 text-destructive bg-destructive/15 hover:bg-destructive/25'
                  : 'border-0 text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:hover:bg-amber-500/30'
              }
              onClick={(e) => {
                e.stopPropagation();
                onBan(user);
              }}
            >
              <Ban className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{user.isBanned ? 'Unban user' : 'Ban user'}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
