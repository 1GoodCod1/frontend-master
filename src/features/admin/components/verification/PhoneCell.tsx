interface PhoneCellProps {
  phone: string | undefined;
}

export default function PhoneCell({ phone }: PhoneCellProps) {
  return <span className="text-sm text-foreground">{phone || '—'}</span>;
}
