import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatRelativeTime,
  eventBadgeVariant,
  formatEventLabel,
} from '../AuditLog'

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return "just now" for times less than 60 seconds ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:30Z'))

    expect(formatRelativeTime('2026-02-15T12:00:00Z')).toBe('just now')
  })

  it('should return minutes ago for times less than 60 minutes ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:05:00Z'))

    expect(formatRelativeTime('2026-02-15T12:00:00Z')).toBe('5m ago')
  })

  it('should return hours ago for times less than 24 hours ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T15:00:00Z'))

    expect(formatRelativeTime('2026-02-15T12:00:00Z')).toBe('3h ago')
  })

  it('should return days ago for times less than 7 days ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-17T12:00:00Z'))

    expect(formatRelativeTime('2026-02-15T12:00:00Z')).toBe('2d ago')
  })

  it('should return locale date string for times 7 or more days ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-25T12:00:00Z'))

    const result = formatRelativeTime('2026-02-15T12:00:00Z')
    // toLocaleDateString output varies by locale, just check it's not a relative format
    expect(result).not.toContain('ago')
    expect(result).not.toBe('just now')
  })

  it('should handle boundary: exactly 60 seconds returns 1m ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:01:00Z'))

    expect(formatRelativeTime('2026-02-15T12:00:00Z')).toBe('1m ago')
  })

  it('should handle boundary: exactly 60 minutes returns 1h ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T13:00:00Z'))

    expect(formatRelativeTime('2026-02-15T12:00:00Z')).toBe('1h ago')
  })
})

describe('eventBadgeVariant', () => {
  it('should return destructive for failed events', () => {
    expect(eventBadgeVariant('webhook.delivery_failed')).toBe('destructive')
  })

  it('should return success for confirmed events', () => {
    expect(eventBadgeVariant('submission.confirmed')).toBe('success')
  })

  it('should return success for succeeded events', () => {
    expect(eventBadgeVariant('webhook.delivery_succeeded')).toBe('success')
  })

  it('should return default for created events', () => {
    expect(eventBadgeVariant('schema.created')).toBe('default')
  })

  it('should return default for registered events', () => {
    expect(eventBadgeVariant('webhook.registered')).toBe('default')
  })

  it('should return secondary for unrecognized events', () => {
    expect(eventBadgeVariant('publishable_key.rotated')).toBe('secondary')
  })

  it('should prioritize failed over other keywords', () => {
    // "failed" check runs first
    expect(eventBadgeVariant('creation_failed')).toBe('destructive')
  })
})

describe('formatEventLabel', () => {
  it('should replace dots and underscores with spaces', () => {
    expect(formatEventLabel('schema.created')).toBe('schema created')
  })

  it('should replace underscores with spaces', () => {
    expect(formatEventLabel('webhook.delivery_failed')).toBe('webhook delivery failed')
  })

  it('should handle multiple dots', () => {
    expect(formatEventLabel('a.b.c')).toBe('a b c')
  })

  it('should return plain string unchanged', () => {
    expect(formatEventLabel('event')).toBe('event')
  })
})
