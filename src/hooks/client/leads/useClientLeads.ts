import { useState, useMemo } from 'react';
import { useLeadsMyListQuery } from '@/features/leads/leadsApi';
import { extractItems } from '@/utils/data';
import {
  LEAD_STATUS_OPTIONS,
  type LeadStatus,
  type LeadFilterStatus,
} from '@/types/leads';

export const STATUS_OPTIONS = LEAD_STATUS_OPTIONS;
export type Status = LeadStatus;
export type FilterStatus = LeadFilterStatus;

export type ClientLeadListItem = { id: string } & Record<string, unknown>;

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
