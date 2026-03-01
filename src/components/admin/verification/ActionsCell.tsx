import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionsCellProps {
  id: string;
  onReview: (id: string) => void;
}

export default function ActionsCell({ id, onReview }: ActionsCellProps) {
  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onReview(id)}>
      <Eye className="size-4" />
      Review
    </Button>
  );
}
