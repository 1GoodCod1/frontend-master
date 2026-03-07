import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CityCellProps {
  city: { name?: string | null } | null;
  cityName?: string;
}

export default function CityCell({ city, cityName }: CityCellProps) {
  const name = city?.name ?? cityName ?? '—';

  return (
    <Badge variant="outline" className="font-medium text-xs gap-1 border-primary/30 text-primary">
      <MapPin className="size-3.5" />
      {name}
    </Badge>
  );
}
