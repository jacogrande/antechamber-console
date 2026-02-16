import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockGetAuthHeaders } = vi.hoisted(() => ({
  mockGetAuthHeaders: vi.fn(),
}))

vi.mock('../client', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as object),
    getAuthHeaders: mockGetAuthHeaders,
    API_BASE: 'http://localhost:3000/api',
  }
})

import { exportSubmissionCsv, exportContextPack } from '../submissions'

describe('exportSubmissionCsv', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    mockGetAuthHeaders.mockResolvedValue(
      new Headers({ Authorization: 'Bearer test-token' })
    )
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should return blob on successful response', async () => {
    const csvContent = 'field,value\ncompany_name,Acme'
    const mockBlob = new Blob([csvContent], { type: 'text/csv' })

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    })

    const result = await exportSubmissionCsv('sub-123')

    expect(result).toBeInstanceOf(Blob)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/submissions/sub-123/export/csv',
      expect.objectContaining({ headers: expect.any(Headers) })
    )
  })

  it('should throw with parsed error message on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: { message: 'Submission not confirmed' } }),
    })

    await expect(exportSubmissionCsv('sub-123')).rejects.toThrow('Submission not confirmed')
  })

  it('should throw with fallback message when error body is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not JSON')),
    })

    await expect(exportSubmissionCsv('sub-123')).rejects.toThrow('Failed to export CSV')
  })
})

describe('exportContextPack', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    mockGetAuthHeaders.mockResolvedValue(
      new Headers({ Authorization: 'Bearer test-token' })
    )
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should return blob on successful response', async () => {
    const jsonContent = JSON.stringify({ submission: {} })
    const mockBlob = new Blob([jsonContent], { type: 'application/json' })

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    })

    const result = await exportContextPack('sub-456')

    expect(result).toBeInstanceOf(Blob)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/submissions/sub-456/context-pack',
      expect.objectContaining({ headers: expect.any(Headers) })
    )
  })

  it('should throw with parsed error message on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: { message: 'Not yet confirmed' } }),
    })

    await expect(exportContextPack('sub-456')).rejects.toThrow('Not yet confirmed')
  })

  it('should throw with fallback message when error body is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not JSON')),
    })

    await expect(exportContextPack('sub-456')).rejects.toThrow('Failed to export context pack')
  })
})
