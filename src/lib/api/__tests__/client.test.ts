import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
  },
}))

import { ApiError } from '../client'

// We need to re-import after mocking to get the mocked version
const { apiGet, apiDelete, apiPost } = await import('../client')

describe('handleResponse', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    })
    localStorage.setItem('tenantId', 'tenant-123')
  })

  afterEach(() => {
    global.fetch = originalFetch
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('should return undefined for 204 No Content', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    })

    const result = await apiDelete('/webhooks/123')

    expect(result).toBeUndefined()
  })

  it('should return undefined for content-length 0', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-length': '0' }),
      json: () => Promise.reject(new Error('should not be called')),
    })

    const result = await apiGet('/test')

    expect(result).toBeUndefined()
  })

  it('should parse JSON for 200 responses with body', async () => {
    const data = { id: '123', name: 'Test' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(data),
    })

    const result = await apiGet<typeof data>('/test')

    expect(result).toEqual(data)
  })

  it('should throw ApiError on error responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      json: () =>
        Promise.resolve({
          error: { code: 'NOT_FOUND', message: 'Resource not found' },
        }),
    })

    await expect(apiGet('/missing')).rejects.toThrow(ApiError)
    await expect(apiGet('/missing')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Resource not found',
    })
  })

  it('should throw ApiError with fallback message when error body is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers(),
      json: () => Promise.reject(new Error('not JSON')),
    })

    await expect(apiPost('/fail')).rejects.toMatchObject({
      status: 500,
      code: 'UNKNOWN_ERROR',
      message: 'Internal Server Error',
    })
  })
})
