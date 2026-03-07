import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingState, ErrorState } from '@/components/common/States';
import { AutoCharts } from '@/components/common/AutoCharts';

interface StatsTabProps {
  timeframe: 'day' | 'week' | 'month';
  onTimeframeChange: (timeframe: 'day' | 'week' | 'month') => void;
  stats: {
    isLoading: boolean;
    isError: boolean;
    error?: unknown;
    data?: unknown;
    refetch: () => void;
  };
}

export default function StatsTab({ timeframe, onTimeframeChange, stats }: StatsTabProps) {
  const label =
    timeframe === 'day' ? 'Last 24 hours' : timeframe === 'week' ? 'Last 7 days' : 'Last 30 days';

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={timeframe} onValueChange={(v) => onTimeframeChange(v as 'day' | 'week' | 'month')}>
          <SelectTrigger className="w-[220px] h-9" aria-label="Timeframe">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">📅 Last Day</SelectItem>
            <SelectItem value="week">📊 Last Week</SelectItem>
            <SelectItem value="month">📈 Last Month</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="font-semibold bg-primary/15 text-primary">
          Viewing: {label}
        </Badge>
      </div>

      {stats.isLoading ? (
        <LoadingState />
      ) : stats.isError ? (
        <ErrorState error={stats.error} onRetry={stats.refetch} />
      ) : (
        <div className="space-y-6">
          <AutoCharts title="Audit Statistics" data={stats.data} />
        </div>
      )}
    </div>
  );
}
