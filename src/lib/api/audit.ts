import { apiGet } from './client'

export interface AuditLog {
  id: string
  event: string
  resourceType: string
  resourceId: string
  userId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

export interface AuditLogsResponse {
  auditLogs: AuditLog[]
  total: number
  hasMore: boolean
}

export interface ListAuditLogsParams {
  limit?: number
  offset?: number
  event?: string
  resourceType?: string
}

export async function listAuditLogs(
  params: ListAuditLogsParams = {}
): Promise<AuditLogsResponse> {
  const searchParams = new URLSearchParams()
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.offset) searchParams.set('offset', String(params.offset))
  if (params.event) searchParams.set('event', params.event)
  if (params.resourceType) searchParams.set('resourceType', params.resourceType)

  const query = searchParams.toString()
  const path = query ? `/audit-logs?${query}` : '/audit-logs'
  return apiGet<AuditLogsResponse>(path)
}
