interface DocumentNumberCellProps {
  documentNumber: string | undefined;
}

export default function DocumentNumberCell({ documentNumber }: DocumentNumberCellProps) {
  return <span className="text-sm text-foreground">{documentNumber || '—'}</span>;
}
