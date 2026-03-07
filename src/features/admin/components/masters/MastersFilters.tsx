import { Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MastersFiltersProps {
  qText: string;
  verified: boolean;
  featured: boolean;
  allMastersLength: number;
  onQTextChange: (value: string) => void;
  onVerifiedChange: (value: boolean) => void;
  onFeaturedChange: (value: boolean) => void;
  onExport: () => void;
}

export default function MastersFilters({
  qText,
  verified,
  featured,
  allMastersLength,
  onQTextChange,
  onVerifiedChange,
  onFeaturedChange,
  onExport,
}: MastersFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={!allMastersLength}
                className="gap-2"
              >
                <Download className="size-4" />
                Export
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Export masters to CSV</TooltipContent>
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
      <div className="flex items-center gap-2">
        <Switch
          id="masters-verified"
          checked={verified}
          onCheckedChange={onVerifiedChange}
        />
        <Label htmlFor="masters-verified" className="cursor-pointer text-sm font-normal">
          Verified only
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="masters-featured"
          checked={featured}
          onCheckedChange={onFeaturedChange}
        />
        <Label htmlFor="masters-featured" className="cursor-pointer text-sm font-normal">
          Featured only
        </Label>
      </div>
    </div>
  );
}
