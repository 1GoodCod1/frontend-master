export const TEMPLATE_OVERRIDE_FALLBACK = [
  'welcome-1',
  'master-welcome-1',
  'digest-client',
  'digest-master',
  'new-feature-masters',
] as const;

export const BROADCAST_SEGMENTS = [
  { value: 'all_masters', labelKey: 'admin.digest.segmentAllMasters' },
  { value: 'new_masters', labelKey: 'admin.digest.segmentNewMasters' },
  { value: 'all_clients', labelKey: 'admin.digest.segmentAllClients' },
  { value: 'digest_subscribers', labelKey: 'admin.digest.segmentDigestSubscribers' },
] as const;
