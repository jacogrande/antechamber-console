import { describe, it, expect } from 'vitest'
import {
  ok,
  err,
  isOk,
  isErr,
  map,
  flatMap,
  unwrap,
  unwrapOr,
  mapErr,
  match,
  type Result,
} from '@/lib/utils/result'

describe('Result', () => {
  describe('ok', () => {
    it('should create an Ok result with value', () => {
      // Arrange & Act
      const result = ok(42)

      // Assert
      expect(result.isOk).toBe(true)
      expect(result.isErr).toBe(false)
      expect(result.value).toBe(42)
    })

    it('should create an Ok result with string value', () => {
      // Arrange & Act
      const result = ok('success')

      // Assert
      expect(result.isOk).toBe(true)
      expect(result.value).toBe('success')
    })

    it('should create an Ok result with null value', () => {
      // Arrange & Act
      const result = ok(null)

      // Assert
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(null)
    })
  })

  describe('err', () => {
    it('should create an Err result with error', () => {
      // Arrange & Act
      const result = err('error message')

      // Assert
      expect(result.isOk).toBe(false)
      expect(result.isErr).toBe(true)
      expect(result.error).toBe('error message')
    })

    it('should create an Err result with error object', () => {
      // Arrange
      const error = new Error('something failed')

      // Act
      const result = err(error)

      // Assert
      expect(result.isErr).toBe(true)
      expect(result.error).toBe(error)
    })
  })

  describe('isOk', () => {
    it('should return true for Ok result', () => {
      // Arrange
      const result = ok(42)

      // Act
      const resultIsOk = isOk(result)

      // Assert
      expect(resultIsOk).toBe(true)
    })

    it('should return false for Err result', () => {
      // Arrange
      const result = err('error')

      // Act
      const resultIsOk = isOk(result)

      // Assert
      expect(resultIsOk).toBe(false)
    })

    it('should narrow type to Ok when true', () => {
      // Arrange
      const result: Result<number, string> = ok(42)

      // Act & Assert
      if (isOk(result)) {
        // TypeScript should know result.value exists
        expect(result.value).toBe(42)
      } else {
        throw new Error('Expected Ok result')
      }
    })
  })

  describe('isErr', () => {
    it('should return true for Err result', () => {
      // Arrange
      const result = err('error')

      // Act
      const resultIsErr = isErr(result)

      // Assert
      expect(resultIsErr).toBe(true)
    })

    it('should return false for Ok result', () => {
      // Arrange
      const result = ok(42)

      // Act
      const resultIsErr = isErr(result)

      // Assert
      expect(resultIsErr).toBe(false)
    })

    it('should narrow type to Err when true', () => {
      // Arrange
      const result: Result<number, string> = err('error')

      // Act & Assert
      if (isErr(result)) {
        // TypeScript should know result.error exists
        expect(result.error).toBe('error')
      } else {
        throw new Error('Expected Err result')
      }
    })
  })

  describe('map', () => {
    it('should apply function to Ok value', () => {
      // Arrange
      const result = ok(10)
      const double = (n: number) => n * 2

      // Act
      const mapped = map(result, double)

      // Assert
      expect(isOk(mapped)).toBe(true)
      if (isOk(mapped)) {
        expect(mapped.value).toBe(20)
      }
    })

    it('should not apply function to Err value', () => {
      // Arrange
      const result: Result<number, string> = err('error')
      const double = (n: number) => n * 2

      // Act
      const mapped = map(result, double)

      // Assert
      expect(isErr(mapped)).toBe(true)
      if (isErr(mapped)) {
        expect(mapped.error).toBe('error')
      }
    })

    it('should transform value type', () => {
      // Arrange
      const result = ok(42)
      const toString = (n: number) => `value: ${n}`

      // Act
      const mapped = map(result, toString)

      // Assert
      expect(isOk(mapped)).toBe(true)
      if (isOk(mapped)) {
        expect(mapped.value).toBe('value: 42')
      }
    })
  })

  describe('flatMap', () => {
    it('should chain successful operations', () => {
      // Arrange
      const divide = (a: number, b: number): Result<number, string> => {
        if (b === 0) return err('Division by zero')
        return ok(a / b)
      }
      const result = ok(10)

      // Act
      const chained = flatMap(result, (n: number) => divide(n, 2))

      // Assert
      expect(isOk(chained)).toBe(true)
      if (isOk(chained)) {
        expect(chained.value).toBe(5)
      }
    })

    it('should short-circuit on Err', () => {
      // Arrange
      const divide = (a: number, b: number): Result<number, string> => {
        if (b === 0) return err('Division by zero')
        return ok(a / b)
      }
      const result: Result<number, string> = err('initial error')

      // Act
      const chained = flatMap(result, (n: number) => divide(n, 2))

      // Assert
      expect(isErr(chained)).toBe(true)
      if (isErr(chained)) {
        expect(chained.error).toBe('initial error')
      }
    })

    it('should propagate Err from chained operation', () => {
      // Arrange
      const divide = (a: number, b: number): Result<number, string> => {
        if (b === 0) return err('Division by zero')
        return ok(a / b)
      }
      const result = ok(10)

      // Act
      const chained = flatMap(result, (n) => divide(n, 0))

      // Assert
      expect(isErr(chained)).toBe(true)
      if (isErr(chained)) {
        expect(chained.error).toBe('Division by zero')
      }
    })
  })

  describe('unwrap', () => {
    it('should return value from Ok result', () => {
      // Arrange
      const result = ok(42)

      // Act
      const value = unwrap(result)

      // Assert
      expect(value).toBe(42)
    })

    it('should throw error from Err result', () => {
      // Arrange
      const result = err('error message')

      // Act & Assert
      expect(() => unwrap(result)).toThrow('error message')
    })

    it('should throw error object from Err result', () => {
      // Arrange
      const error = new Error('something failed')
      const result = err(error)

      // Act & Assert
      expect(() => unwrap(result)).toThrow(error)
    })
  })

  describe('unwrapOr', () => {
    it('should return value from Ok result', () => {
      // Arrange
      const result = ok(42)

      // Act
      const value = unwrapOr(result, 0)

      // Assert
      expect(value).toBe(42)
    })

    it('should return default value from Err result', () => {
      // Arrange
      const result: Result<number, string> = err('error')

      // Act
      const value = unwrapOr(result, 0)

      // Assert
      expect(value).toBe(0)
    })

    it('should return Ok null value instead of default', () => {
      // Arrange
      const result: Result<number | null, string> = ok(null)

      // Act
      const value = unwrapOr(result, 99)

      // Assert
      expect(value).toBe(null)
    })
  })

  describe('mapErr', () => {
    it('should not apply function to Ok value', () => {
      // Arrange
      const result: Result<number, string> = ok(42)
      const toUpper = (s: string) => s.toUpperCase()

      // Act
      const mapped = mapErr(result, toUpper)

      // Assert
      expect(isOk(mapped)).toBe(true)
      if (isOk(mapped)) {
        expect(mapped.value).toBe(42)
      }
    })

    it('should apply function to Err value', () => {
      // Arrange
      const result: Result<number, string> = err('error')
      const toUpper = (s: string) => s.toUpperCase()

      // Act
      const mapped = mapErr(result, toUpper)

      // Assert
      expect(isErr(mapped)).toBe(true)
      if (isErr(mapped)) {
        expect(mapped.error).toBe('ERROR')
      }
    })

    it('should transform error type', () => {
      // Arrange
      const result: Result<number, string> = err('not found')
      const toErrorObject = (msg: string) => ({ message: msg, code: 404 })

      // Act
      const mapped = mapErr(result, toErrorObject)

      // Assert
      expect(isErr(mapped)).toBe(true)
      if (isErr(mapped)) {
        expect(mapped.error).toEqual({ message: 'not found', code: 404 })
      }
    })
  })

  describe('match', () => {
    it('should call ok handler for Ok result', () => {
      // Arrange
      const result = ok(42)

      // Act
      const output = match(result, {
        ok: (value) => `success: ${value}`,
        err: (error) => `error: ${error}`,
      })

      // Assert
      expect(output).toBe('success: 42')
    })

    it('should call err handler for Err result', () => {
      // Arrange
      const result: Result<number, string> = err('failed')

      // Act
      const output = match(result, {
        ok: (value) => `success: ${value}`,
        err: (error) => `error: ${error}`,
      })

      // Assert
      expect(output).toBe('error: failed')
    })

    it('should transform to different type', () => {
      // Arrange
      const result = ok('data')

      // Act
      const output = match(result, {
        ok: (value) => value.length,
        err: () => 0,
      })

      // Assert
      expect(output).toBe(4)
    })
  })
})
