import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSubmissions } from '@/hooks/useSubmissions'
import { EmptyState, LoadingSpinner, RetryableAlert } from '@/components/common'
import { SubmissionStatusBadge } from '@/components/dashboard/SubmissionStatusBadge'
import { Button } from '@/components/ui/button'
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
import type { SubmissionStatus } from '@/types/submission'

const PAGE_SIZES = [10, 20, 50]
const DEFAULT_PAGE_SIZE = 20

const statusTabs: { label: string; value: SubmissionStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Draft', value: 'draft' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Failed', value: 'failed' },
]

export function Submissions() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | undefined>(undefined)
  const [offset, setOffset] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const { data, isLoading, error, refetch, isFetching } = useSubmissions({
    status: statusFilter,
    limit: pageSize,
    offset,
  })

  const handleStatusChange = (status: SubmissionStatus | undefined) => {
    setStatusFilter(status)
    setOffset(0)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <RetryableAlert
        message="Failed to load submissions. Please try again."
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  const submissions = data?.submissions ?? []
  const hasMore = data?.hasMore ?? false
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Submissions</h1>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6">
        {statusTabs.map((tab) => (
          <Button
            key={tab.label}
            variant={statusFilter === tab.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleStatusChange(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No submissions yet"
          description={
            statusFilter
              ? `No ${statusFilter} submissions found.`
              : 'Submissions will appear here once created.'
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Website URL</TableHead>
                  <TableHead>Schema</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow
                    key={submission.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/submissions/${submission.id}`)}
                  >
                    <TableCell className="max-w-[300px] truncate">
                      {submission.websiteUrl}
                    </TableCell>
                    <TableCell>{submission.schemaName ?? '-'}</TableCell>
                    <TableCell>
                      <SubmissionStatusBadge status={submission.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleString()}
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
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setOffset(0) }}>
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
    </div>
  )
}
