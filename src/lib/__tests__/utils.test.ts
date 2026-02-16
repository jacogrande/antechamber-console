import { describe, it, expect, vi } from 'vitest'
import {
  cn,
  formatCompact,
  formatRelativeTime,
  formatDate,
  truncate,
  getInitials,
  debounce,
  sleep,
} from '@/lib/utils'

describe('utils', () => {
  describe('formatCompact', () => {
    it('should format 0 as "0"', () => {
      // Arrange & Act
      const result = formatCompact(0)

      // Assert
      expect(result).toBe('0')
    })

    it('should format numbers under 1000 without suffix', () => {
      // Arrange & Act
      const result = formatCompact(999)

      // Assert
      expect(result).toBe('999')
    })

    it('should format 1000 as "1K"', () => {
      // Arrange & Act
      const result = formatCompact(1000)

      // Assert
      expect(result).toBe('1K')
    })

    it('should format 1500 as "1.5K"', () => {
      // Arrange & Act
      const result = formatCompact(1500)

      // Assert
      expect(result).toBe('1.5K')
    })

    it('should format millions with M suffix', () => {
      // Arrange & Act
      const result = formatCompact(1000000)

      // Assert
      expect(result).toBe('1M')
    })

    it('should format 2.5 million as "2.5M"', () => {
      // Arrange & Act
      const result = formatCompact(2500000)

      // Assert
      expect(result).toBe('2.5M')
    })

    it('should handle large numbers', () => {
      // Arrange & Act
      const result = formatCompact(1234567)

      // Assert
      expect(result).toBe('1.2M')
    })
  })

  describe('formatRelativeTime', () => {
    it('should return "just now" for times less than 60 seconds ago', () => {
      // Arrange
      const date = new Date(Date.now() - 30 * 1000) // 30 seconds ago

      // Act
      const result = formatRelativeTime(date)

      // Assert
      expect(result).toBe('just now')
    })

    it('should return "Xm ago" for minutes', () => {
      // Arrange
      const date = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago

      // Act
      const result = formatRelativeTime(date)

      // Assert
      expect(result).toBe('5m ago')
    })

    it('should return "Xh ago" for hours', () => {
      // Arrange
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago

      // Act
      const result = formatRelativeTime(date)

      // Assert
      expect(result).toBe('3h ago')
    })

    it('should return "Xd ago" for days', () => {
      // Arrange
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago

      // Act
      const result = formatRelativeTime(date)

      // Assert
      expect(result).toBe('2d ago')
    })

    it('should return formatted date string for dates over 7 days ago', () => {
      // Arrange
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      const expected = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })

      // Act
      const result = formatRelativeTime(date)

      // Assert
      expect(result).toBe(expected)
    })

    it('should accept string date', () => {
      // Arrange
      const date = new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago

      // Act
      const result = formatRelativeTime(date)

      // Assert
      expect(result).toBe('2m ago')
    })
  })

  describe('formatDate', () => {
    it('should return "-" for null', () => {
      // Arrange & Act
      const result = formatDate(null)

      // Assert
      expect(result).toBe('-')
    })

    it('should format Date object', () => {
      // Arrange
      const date = new Date('2024-01-15T12:00:00Z')
      const expected = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      // Act
      const result = formatDate(date)

      // Assert
      expect(result).toBe(expected)
    })

    it('should format date string', () => {
      // Arrange
      const dateStr = '2024-03-20T12:00:00Z'
      const date = new Date(dateStr)
      const expected = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      // Act
      const result = formatDate(dateStr)

      // Assert
      expect(result).toBe(expected)
    })

    it('should accept custom options', () => {
      // Arrange — formatDate merges custom options onto defaults {month:'short', day:'numeric', year:'numeric'}
      const date = new Date('2024-06-10T12:00:00Z')
      const expected = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

      // Act
      const result = formatDate(date, { month: 'long', day: 'numeric' })

      // Assert
      expect(result).toBe(expected)
    })
  })

  describe('truncate', () => {
    it('should return original string if shorter than length', () => {
      // Arrange
      const text = 'short'

      // Act
      const result = truncate(text, 10)

      // Assert
      expect(result).toBe('short')
    })

    it('should return original string if equal to length', () => {
      // Arrange
      const text = 'exactly10!'

      // Act
      const result = truncate(text, 10)

      // Assert
      expect(result).toBe('exactly10!')
    })

    it('should truncate string with ellipsis', () => {
      // Arrange
      const text = 'This is a long string that needs truncating'

      // Act
      const result = truncate(text, 10)

      // Assert
      expect(result).toBe('This is a ...')
    })

    it('should handle empty string', () => {
      // Arrange
      const text = ''

      // Act
      const result = truncate(text, 10)

      // Assert
      expect(result).toBe('')
    })
  })

  describe('getInitials', () => {
    it('should return initials for full name', () => {
      // Arrange & Act
      const result = getInitials('John Doe')

      // Assert
      expect(result).toBe('JD')
    })

    it('should return single initial for single name', () => {
      // Arrange & Act
      const result = getInitials('Alice')

      // Assert
      expect(result).toBe('A')
    })

    it('should return empty string for empty name', () => {
      // Arrange & Act
      const result = getInitials('')

      // Assert
      expect(result).toBe('')
    })

    it('should return first two initials for three names', () => {
      // Arrange & Act
      const result = getInitials('John Michael Doe')

      // Assert
      expect(result).toBe('JM')
    })

    it('should uppercase initials', () => {
      // Arrange & Act
      const result = getInitials('john doe')

      // Assert
      expect(result).toBe('JD')
    })

    it('should handle names with extra spaces', () => {
      // Arrange & Act
      const result = getInitials('John  Doe')

      // Assert
      expect(result).toBe('JD')
    })
  })

  describe('cn', () => {
    it('should merge class names', () => {
      // Arrange & Act
      const result = cn('foo', 'bar')

      // Assert
      expect(result).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      // Arrange & Act
      const result = cn('foo', false && 'bar', 'baz')

      // Assert
      expect(result).toBe('foo baz')
    })

    it('should resolve Tailwind conflicts', () => {
      // Arrange & Act
      const result = cn('px-2', 'px-4')

      // Assert
      expect(result).toBe('px-4')
    })

    it('should handle empty inputs', () => {
      // Arrange & Act
      const result = cn()

      // Assert
      expect(result).toBe('')
    })
  })

  describe('debounce', () => {
    it('should delay function execution', async () => {
      // Arrange
      vi.useFakeTimers()
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      // Act
      debounced()

      // Assert - not called yet
      expect(fn).not.toHaveBeenCalled()

      // Advance time
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should cancel previous calls', () => {
      // Arrange
      vi.useFakeTimers()
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      // Act - call multiple times
      debounced()
      debounced()
      debounced()

      // Assert - only last call should fire
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should pass arguments to the debounced function', () => {
      // Arrange
      vi.useFakeTimers()
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      // Act
      debounced('hello', 42)
      vi.advanceTimersByTime(100)

      // Assert
      expect(fn).toHaveBeenCalledWith('hello', 42)

      vi.useRealTimers()
    })
  })

  describe('sleep', () => {
    it('should resolve after specified duration', async () => {
      // Arrange
      vi.useFakeTimers()

      // Act
      const promise = sleep(100)
      vi.advanceTimersByTime(100)
      await promise

      // Assert - if we reach here, sleep resolved correctly
      expect(true).toBe(true)

      vi.useRealTimers()
    })

    it('should return a promise', () => {
      // Arrange & Act
      const result = sleep(0)

      // Assert
      expect(result).toBeInstanceOf(Promise)
    })
  })
})
