import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface BulkActionsProps {
  bulkIdsLength: number;
  onCreate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export default function BulkActions({ bulkIdsLength, onCreate, onToggle, onDelete }: BulkActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={onCreate}
        className="border-0 bg-amber-600 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600"
      >
        Create
      </Button>
      <Separator orientation="vertical" className="hidden h-6 sm:block" />
      <Button
        onClick={onToggle}
        disabled={!bulkIdsLength}
        className="border-0 bg-amber-50 text-amber-700 shadow-sm transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40 disabled:opacity-50"
      >
        Toggle selected
      </Button>
      <Button
        variant="destructive"
        onClick={onDelete}
        disabled={!bulkIdsLength}
        className="border-0"
      >
        Delete selected
      </Button>
    </div>
  );
}
