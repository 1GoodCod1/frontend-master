interface DocumentTypeCellProps {
  documentType: string | undefined;
}

export default function DocumentTypeCell({ documentType }: DocumentTypeCellProps) {
  return <span className="text-sm text-foreground">{documentType || '—'}</span>;
}
