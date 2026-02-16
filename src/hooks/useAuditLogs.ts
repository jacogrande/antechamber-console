import { useQuery } from '@tanstack/react-query'
import { listAuditLogs, type ListAuditLogsParams } from '@/lib/api/audit'

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (params?: ListAuditLogsParams) => [...auditLogKeys.lists(), params] as const,
}

export function useAuditLogs(params: ListAuditLogsParams = {}) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => listAuditLogs(params),
  })
}
