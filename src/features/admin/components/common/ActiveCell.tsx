import { Switch } from '@/components/ui/switch';

interface ActiveCellProps {
  id: string;
  checked: boolean;
  onToggle: (id: string) => void;
}

export default function ActiveCell({ id, checked, onToggle }: ActiveCellProps) {
  if (!id) return <span />;
  return (
    <Switch checked={checked} onCheckedChange={() => onToggle(id)} aria-label="" />
  );
}
