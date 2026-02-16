import { apiGet, apiPost, getAuthHeaders, API_BASE, ApiError } from './client'
import type {
  SubmissionsListResponse,
  SubmissionDetailResponse,
  SubmissionStatus,
} from '@/types/submission'

export interface ListSubmissionsParams {
  status?: SubmissionStatus
  limit?: number
  offset?: number
}

export async function listSubmissions(
  params: ListSubmissionsParams = {}
): Promise<SubmissionsListResponse> {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set('status', params.status)
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.offset) searchParams.set('offset', String(params.offset))

  const query = searchParams.toString()
  const path = query ? `/submissions?${query}` : '/submissions'
  return apiGet<SubmissionsListResponse>(path)
}

export interface CreateSubmissionParams {
  schemaId: string
  websiteUrl: string
  schemaVersion?: number
  customerMeta?: Record<string, unknown>
}

export interface CreateSubmissionResponse {
  submissionId: string
  workflowRunId: string
}

export async function createSubmission(
  params: CreateSubmissionParams
): Promise<CreateSubmissionResponse> {
  return apiPost<CreateSubmissionResponse>('/submissions', params)
}

export async function getSubmission(id: string): Promise<SubmissionDetailResponse> {
  return apiGet<SubmissionDetailResponse>(`/submissions/${id}`)
}

export interface FieldEdit {
  fieldKey: string
  value: unknown
}

export interface ConfirmSubmissionParams {
  edits?: FieldEdit[]
}

export async function confirmSubmission(id: string, params?: ConfirmSubmissionParams): Promise<void> {
  return apiPost<void>(`/submissions/${id}/confirm`, {
    confirmedBy: 'internal',
    edits: params?.edits,
  })
}

async function handleBlobResponse(response: Response, fallbackMessage: string): Promise<Blob> {
  if (!response.ok) {
    let errorMessage = fallbackMessage
    try {
      const errorData = await response.json() as { error?: { message?: string } }
      errorMessage = errorData?.error?.message ?? errorMessage
    } catch {
      // Response body may not be JSON
    }
    throw new ApiError(response.status, 'EXPORT_ERROR', errorMessage)
  }
  return response.blob()
}

export async function exportSubmissionCsv(id: string): Promise<Blob> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE}/submissions/${id}/export/csv`, { headers })
  return handleBlobResponse(response, 'Failed to export CSV')
}

export async function exportContextPack(id: string): Promise<Blob> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE}/submissions/${id}/context-pack`, { headers })
  return handleBlobResponse(response, 'Failed to export context pack')
}
