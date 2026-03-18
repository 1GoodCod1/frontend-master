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

  const { data, isLoading, isError, error, refetch } = useLeadsMyListQuery(params);
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
