interface EmailCellProps {
  email: string | undefined;
}

export default function EmailCell({ email }: EmailCellProps) {
  return <span className="text-sm text-muted-foreground">{email || '—'}</span>;
}
