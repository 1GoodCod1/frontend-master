import { Button } from '@/components/ui/button';

interface ActionsCellProps {
  id: string;
  name?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActionsCell({ id, name: _name, onEdit, onDelete }: ActionsCellProps) {
  if (!id) return <span />;
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={onEdit}
        className="border-0 bg-amber-50 text-amber-700 shadow-sm transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
      >
        Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete} className="border-0">
        Delete
      </Button>
    </div>
  );
}
