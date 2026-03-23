import { useState, useMemo } from 'react';
import { useLeadsMyListQuery } from '@/features/leads/leadsApi';
import { extractItems } from '@/utils/data';
import type { ClientLeadListItem, FilterStatus } from '.';

export function useClientLeads() {
  const [status, setStatus] = useState<FilterStatus>('ALL');

  const params = useMemo(() => {
    if (status === 'ALL') return undefined;
    return { status };
  }, [status]);

  const { data, isLoading, isError, error, refetch } = useLeadsMyListQuery(params, {
    // Status is updated by the master in their app; this client has no mutation → stale RTK cache.
    refetchOnFocus: true,
    refetchOnMountOrArgChange: 30,
    pollingInterval: 30_000,
  });
  const items = extractItems<ClientLeadListItem>(data);

  return {
    items,
    status,
    setStatus,
    isLoading,
    isError,
    error,
    refetch,
  };
}
