import { Shield } from 'lucide-react';

export default function AuditEmptyState() {
  return (
    <div className="py-12 px-6 text-center">
      <Shield className="mx-auto size-20 text-muted-foreground/30 mb-4" />
      <p className="text-lg font-semibold text-foreground mb-1">No Audit Logs Yet</p>
      <p className="text-sm text-muted-foreground">
        Audit logs will appear here when users perform actions on the platform
      </p>
    </div>
  );
}
