import { Eye } from 'lucide-react';

interface ViewsCellProps {
  views: number | undefined;
}

export default function ViewsCell({ views }: ViewsCellProps) {
  const viewsValue = views ?? 0;

  return (
    <div className="flex items-center gap-1">
      <Eye className="size-4 text-primary shrink-0" />
      <span className="text-sm font-semibold text-foreground">{viewsValue.toLocaleString()}</span>
    </div>
  );
}
