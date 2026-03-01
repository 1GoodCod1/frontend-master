import { Button } from '@/components/ui/button';

interface ActionsCellProps {
  id: string;
  name: string | undefined;
  onEdit: (row: Record<string, unknown>) => void;
  onDelete: (id: string, name?: string) => void;
  row: Record<string, unknown>;
}

export default function ActionsCell({ id, name, onEdit, onDelete, row }: ActionsCellProps) {
  if (!id) return <span />;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(row)}>
        Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(id, name)}>
        Delete
      </Button>
    </div>
  );
}
