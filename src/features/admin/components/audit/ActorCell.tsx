import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import {
  formatAuditActorLabel,
  auditActorLabelUsesMonoFont,
  type AuditActorUser,
} from '@/utils/auditDisplay';

interface ActorCellProps {
  actorId: string | undefined;
  user?: AuditActorUser;
}

export default function ActorCell({ actorId, user }: ActorCellProps) {
  const { t } = useTranslation();
  const display = formatAuditActorLabel(t, actorId, user);
  const rawId = String(actorId ?? '').trim();
  const mono = auditActorLabelUsesMonoFont(display);

  return (
    <div className="flex items-start gap-2 min-w-0">
      <User className="size-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
      <span
        className={`text-xs leading-snug break-words min-w-0 ${mono ? 'font-mono' : 'font-medium text-foreground'}`}
        title={rawId.length > 0 ? rawId : undefined}
      >
        {display}
      </span>
    </div>
  );
}
