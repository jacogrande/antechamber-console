import { useState } from 'react'
import { ScrollText, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { EmptyState, LoadingSpinner, RetryableAlert } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AuditLog as AuditLogEntry } from '@/lib/api/audit'

const PAGE_SIZES = [20, 50, 100]
const DEFAULT_PAGE_SIZE = 50

const eventTypes = [
  { value: '', label: 'All Events' },
  { value: 'schema.created', label: 'Schema Created' },
  { value: 'schema.version_created', label: 'Schema Version Created' },
  { value: 'submission.created', label: 'Submission Created' },
  { value: 'submission.confirmed', label: 'Submission Confirmed' },
  { value: 'submission.field_edited', label: 'Field Edited' },
  { value: 'webhook.registered', label: 'Webhook Registered' },
  { value: 'webhook.delivery_succeeded', label: 'Webhook Delivered' },
  { value: 'webhook.delivery_failed', label: 'Webhook Failed' },
  { value: 'publishable_key.created', label: 'Key Created' },
  { value: 'publishable_key.revoked', label: 'Key Revoked' },
]

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

export function eventBadgeVariant(event: string): 'default' | 'secondary' | 'destructive' | 'success' {
  if (event.includes('failed')) return 'destructive'
  if (event.includes('confirmed') || event.includes('succeeded')) return 'success'
  if (event.includes('created') || event.includes('registered')) return 'default'
  return 'secondary'
}

export function formatEventLabel(event: string): string {
  return event.replace(/[._]/g, ' ')
}

export function AuditLog() {
  const [eventFilter, setEventFilter] = useState<string>('')
  const [offset, setOffset] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  const { data, isLoading, error, refetch, isFetching } = useAuditLogs({
    event: eventFilter || undefined,
    limit: pageSize,
    offset,
  })

  const handleEventChange = (value: string) => {
    setEventFilter(value)
    setOffset(0)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setOffset(0)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <RetryableAlert
        message="Failed to load audit logs. Please try again."
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  const logs = data?.auditLogs ?? []
  const hasMore = data?.hasMore ?? false
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <div className="flex items-center gap-2">
          <Select value={eventFilter} onValueChange={handleEventChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit events yet"
          description={
            eventFilter
              ? 'No events match the selected filter.'
              : 'Audit events will appear here as actions are taken.'
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Resource Type</TableHead>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap" title={new Date(log.createdAt).toLocaleString()}>
                      {formatRelativeTime(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={eventBadgeVariant(log.event)}>
                        {formatEventLabel(log.event)}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {log.resourceType.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate" title={log.resourceId}>
                      {log.resourceId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate" title={log.userId ?? undefined}>
                      {log.userId ? `${log.userId.slice(0, 8)}...` : '-'}
                    </TableCell>
                    <TableCell>
                      {log.details ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Showing {offset + 1}–{Math.min(offset + pageSize, total)} of {total}
              </span>
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - pageSize))}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + pageSize)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Details dialog */}
      <Dialog open={selectedLog !== null} onOpenChange={(open) => { if (!open) setSelectedLog(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            {selectedLog && (
              <DialogDescription>
                {formatEventLabel(selectedLog.event)} — {new Date(selectedLog.createdAt).toLocaleString()}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedLog?.details && (
            <pre className="p-4 bg-muted rounded-md text-xs font-mono overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap break-all">
              {JSON.stringify(selectedLog.details, null, 2)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
