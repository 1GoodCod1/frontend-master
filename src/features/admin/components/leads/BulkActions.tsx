import { STATUS_OPTIONS, type StatusOption } from '@/hooks/admin/leads';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface BulkActionsProps {
  selection: string[];
  bulkStatus: StatusOption;
  isLoading: boolean;
  onBulkStatusChange: (value: StatusOption) => void;
  onApply: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({
  selection,
  bulkStatus,
  isLoading,
  onBulkStatusChange,
  onApply,
  onClearSelection,
}: BulkActionsProps) {
  return (
    <div className="p-4 mb-4 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in duration-200">
      <Label className="text-sm font-semibold text-foreground mb-3 block">Bulk Actions</Label>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={bulkStatus} onValueChange={(v) => onBulkStatusChange(v as StatusOption)}>
          <SelectTrigger className="w-[220px] h-9" aria-label="Change status to">
            <SelectValue placeholder="Change status to" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button disabled={isLoading || selection.length === 0} onClick={onApply}>
          Apply to {selection.length || 0} selected
        </Button>
        {selection.length > 0 && (
          <Badge
            variant="secondary"
            className="cursor-pointer font-semibold bg-primary/15 text-primary hover:bg-primary/25"
            onClick={onClearSelection}
          >
            {selection.length} lead(s) selected ×
          </Badge>
        )}
      </div>
    </div>
  );
}
