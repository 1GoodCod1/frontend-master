import { STATUS_OPTIONS, type StatusOption } from '@/hooks/admin/reviews';
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
  updateStatusLoading: boolean;
  moderateLoading: boolean;
  onBulkStatusChange: (status: StatusOption) => void;
  onApplyBulkStatus: () => void;
  onApplyBulkModerate: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({
  selection,
  bulkStatus,
  updateStatusLoading,
  moderateLoading,
  onBulkStatusChange,
  onApplyBulkStatus,
  onApplyBulkModerate,
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
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={updateStatusLoading || selection.length === 0}
          onClick={onApplyBulkStatus}
        >
          Apply to {selection.length || 0} selected
        </Button>
        <Button
          variant="outline"
          disabled={moderateLoading || selection.length === 0}
          onClick={onApplyBulkModerate}
        >
          Moderate {selection.length || 0} selected
        </Button>
        {selection.length > 0 && (
          <Badge
            variant="secondary"
            className="cursor-pointer font-semibold bg-primary/15 text-primary hover:bg-primary/25"
            onClick={onClearSelection}
          >
            {selection.length} review(s) selected ×
          </Badge>
        )}
      </div>
    </div>
  );
}
