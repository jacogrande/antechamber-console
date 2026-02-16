import type { SubmissionStatus, ExtractedField } from '@antechamber/types'

export type { Citation, FieldStatus, SubmissionStatus } from '@antechamber/types'
export type { FieldType, ExtractedField } from '@antechamber/types'

export interface Submission {
  id: string
  schemaId: string
  schemaName: string | null
  websiteUrl: string
  status: SubmissionStatus
  createdAt: string
  updatedAt: string
}

export interface SubmissionsListResponse {
  submissions: Submission[]
  total: number
  hasMore: boolean
}

export interface DashboardStats {
  schemas: { total: number }
  submissions: {
    total: number
    pending: number
    draft: number
    confirmed: number
    failed: number
  }
  webhooks: { active: number }
  llmUsage?: {
    totalInputTokens: number
    totalOutputTokens: number
    estimatedCostUsd: number
  }
}

export interface Tenant {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface TenantResponse {
  tenant: Tenant
}

// Workflow types
export type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface WorkflowStep {
  name: string
  status: WorkflowStepStatus
  startedAt?: string
  completedAt?: string
  error?: string
}

// Extracted field value — extends shared ExtractedField with console display fields
export interface ExtractedFieldValue extends ExtractedField {
  fieldKey: string
  fieldLabel: string
  fieldType?: 'string' | 'number' | 'boolean' | 'enum' | 'string[]'
}

// Crawl artifact
export interface CrawlArtifact {
  url: string
  pageType: string
  fetchedAt: string
  statusCode: number
}

// Submission detail
export interface SubmissionDetail extends Submission {
  workflowRunId: string | null
  workflowSteps?: WorkflowStep[]
  extractedFields?: ExtractedFieldValue[]
  artifacts?: CrawlArtifact[]
  confirmedAt?: string
  confirmedBy?: string
}

export interface SubmissionDetailResponse {
  submission: SubmissionDetail
}
