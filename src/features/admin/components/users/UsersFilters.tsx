import { Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UsersFiltersProps {
  qText: string;
  role: string;
  verified: boolean | null;
  banned: boolean | null;
  /** Total rows matching current filters (from stats), not current page size */
  totalMatching: number;
  exportLoading?: boolean;
  onQTextChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onVerifiedChange: (value: boolean | null) => void;
  onBannedChange: (value: boolean | null) => void;
  onExport: () => void | Promise<void>;
}

export default function UsersFilters({
  qText,
  role,
  verified,
  banned,
  totalMatching,
  exportLoading = false,
  onQTextChange,
  onRoleChange,
  onVerifiedChange,
  onBannedChange,
  onExport,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                size="sm"
                onClick={() => void onExport()}
                disabled={!totalMatching || exportLoading}
                className="gap-2 border-0 bg-amber-600 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600"
              >
                <Download className="size-4" />
                Export
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Export users to CSV</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="relative min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-amber-600 dark:text-amber-400" />
        <Input
          placeholder="Search"
          value={qText}
          onChange={(e) => onQTextChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={role || 'all'} onValueChange={(v) => onRoleChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="MASTER">Master</SelectItem>
          <SelectItem value="CLIENT">Client</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          id="verified-only"
          checked={verified === true}
          onCheckedChange={(checked) => onVerifiedChange(checked ? true : null)}
        />
        <Label htmlFor="verified-only" className="cursor-pointer text-sm font-normal">
          Verified only
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="banned-only"
          checked={banned === true}
          onCheckedChange={(checked) => onBannedChange(checked ? true : null)}
        />
        <Label htmlFor="banned-only" className="cursor-pointer text-sm font-normal">
          Banned only
        </Label>
      </div>
    </div>
  );
}
