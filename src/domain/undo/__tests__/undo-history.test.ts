import { describe, it, expect } from 'vitest'
import {
  createHistory,
  pushAction,
  undo,
  redo,
  canUndo,
  canRedo,
  clearHistory,
  getInverseAction,
} from '@/domain/undo/services/undo-history'
import type { UndoAction } from '@/domain/undo/models/undo-action'
import { isOk, isErr } from '@/lib/utils/result'
import type { FieldDefinition } from '@/types/schema'

// Test fixtures
const createTestField = (overrides: Partial<FieldDefinition> = {}): FieldDefinition => ({
  key: 'test_field',
  label: 'Test Field',
  type: 'string',
  required: false,
  instructions: '',
  ...overrides,
})

describe('undo-history', () => {
  describe('createHistory', () => {
    it('should create empty history with default max size', () => {
      // Arrange & Act
      const history = createHistory()

      // Assert
      expect(history.past).toEqual([])
      expect(history.future).toEqual([])
      expect(history.maxSize).toBe(50)
    })

    it('should create empty history with custom max size', () => {
      // Arrange & Act
      const history = createHistory(100)

      // Assert
      expect(history.past).toEqual([])
      expect(history.future).toEqual([])
      expect(history.maxSize).toBe(100)
    })
  })

  describe('pushAction', () => {
    it('should add action to past stack', () => {
      // Arrange
      const history = createHistory()
      const action: UndoAction = {
        type: 'add',
        field: createTestField(),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }

      // Act
      const newHistory = pushAction(history, action)

      // Assert
      expect(newHistory.past).toHaveLength(1)
      expect(newHistory.past[0]).toBe(action)
      expect(newHistory.future).toEqual([])
    })

    it('should clear future stack when pushing new action', () => {
      // Arrange
      let history = createHistory()
      const action1: UndoAction = {
        type: 'add',
        field: createTestField({ key: 'field1' }),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      const action2: UndoAction = {
        type: 'add',
        field: createTestField({ key: 'field2' }),
        insertIndex: 1,
        inverse: { type: 'delete' },
      }

      history = pushAction(history, action1)
      const undoResult = undo(history)
      if (isOk(undoResult)) {
        history = undoResult.value.history
      }

      // Act
      const newHistory = pushAction(history, action2)

      // Assert
      expect(newHistory.future).toEqual([])
      expect(newHistory.past).toHaveLength(1)
    })

    it('should trim past stack to max size', () => {
      // Arrange
      let history = createHistory(3)

      // Act
      for (let i = 0; i < 5; i++) {
        const action: UndoAction = {
          type: 'add',
          field: createTestField({ key: `field${i}` }),
          insertIndex: i,
          inverse: { type: 'delete' },
        }
        history = pushAction(history, action)
      }

      // Assert
      expect(history.past).toHaveLength(3)
      expect((history.past[0] as any).field.key).toBe('field2')
      expect((history.past[2] as any).field.key).toBe('field4')
    })

    it('should preserve maxSize when pushing actions', () => {
      // Arrange
      const history = createHistory(25)
      const action: UndoAction = {
        type: 'add',
        field: createTestField(),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }

      // Act
      const newHistory = pushAction(history, action)

      // Assert
      expect(newHistory.maxSize).toBe(25)
    })
  })

  describe('undo', () => {
    it('should return error when past stack is empty', () => {
      // Arrange
      const history = createHistory()

      // Act
      const result = undo(history)

      // Assert
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBe('Nothing to undo')
      }
    })

    it('should pop action from past and move to future', () => {
      // Arrange
      let history = createHistory()
      const action: UndoAction = {
        type: 'add',
        field: createTestField(),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      history = pushAction(history, action)

      // Act
      const result = undo(history)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.action).toBe(action)
        expect(result.value.history.past).toHaveLength(0)
        expect(result.value.history.future).toHaveLength(1)
        expect(result.value.history.future[0]).toBe(action)
      }
    })

    it('should undo multiple actions in order', () => {
      // Arrange
      let history = createHistory()
      const action1: UndoAction = {
        type: 'add',
        field: createTestField({ key: 'field1' }),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      const action2: UndoAction = {
        type: 'add',
        field: createTestField({ key: 'field2' }),
        insertIndex: 1,
        inverse: { type: 'delete' },
      }

      history = pushAction(history, action1)
      history = pushAction(history, action2)

      // Act
      const result1 = undo(history)
      expect(isOk(result1)).toBe(true)
      if (isOk(result1)) {
        expect(result1.value.action).toBe(action2)
        history = result1.value.history
      }

      const result2 = undo(history)

      // Assert
      expect(isOk(result2)).toBe(true)
      if (isOk(result2)) {
        expect(result2.value.action).toBe(action1)
        expect(result2.value.history.past).toHaveLength(0)
        expect(result2.value.history.future).toHaveLength(2)
      }
    })
  })

  describe('redo', () => {
    it('should return error when future stack is empty', () => {
      // Arrange
      const history = createHistory()

      // Act
      const result = redo(history)

      // Assert
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBe('Nothing to redo')
      }
    })

    it('should pop action from future and move to past', () => {
      // Arrange
      let history = createHistory()
      const action: UndoAction = {
        type: 'add',
        field: createTestField(),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      history = pushAction(history, action)

      const undoResult = undo(history)
      if (isOk(undoResult)) {
        history = undoResult.value.history
      }

      // Act
      const result = redo(history)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.action).toBe(action)
        expect(result.value.history.past).toHaveLength(1)
        expect(result.value.history.future).toHaveLength(0)
      }
    })

    it('should redo multiple actions in order', () => {
      // Arrange
      let history = createHistory()
      const action1: UndoAction = {
        type: 'add',
        field: createTestField({ key: 'field1' }),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      const action2: UndoAction = {
        type: 'add',
        field: createTestField({ key: 'field2' }),
        insertIndex: 1,
        inverse: { type: 'delete' },
      }

      history = pushAction(history, action1)
      history = pushAction(history, action2)

      const undo1 = undo(history)
      if (isOk(undo1)) history = undo1.value.history
      const undo2 = undo(history)
      if (isOk(undo2)) history = undo2.value.history

      // Act
      const result1 = redo(history)
      expect(isOk(result1)).toBe(true)
      if (isOk(result1)) {
        expect(result1.value.action).toBe(action1)
        history = result1.value.history
      }

      const result2 = redo(history)

      // Assert
      expect(isOk(result2)).toBe(true)
      if (isOk(result2)) {
        expect(result2.value.action).toBe(action2)
        expect(result2.value.history.past).toHaveLength(2)
        expect(result2.value.history.future).toHaveLength(0)
      }
    })
  })

  describe('canUndo', () => {
    it('should return false for empty history', () => {
      // Arrange
      const history = createHistory()

      // Act & Assert
      expect(canUndo(history)).toBe(false)
    })

    it('should return true when past stack has actions', () => {
      // Arrange
      let history = createHistory()
      const action: UndoAction = {
        type: 'add',
        field: createTestField(),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      history = pushAction(history, action)

      // Act & Assert
      expect(canUndo(history)).toBe(true)
    })

    it('should return false after undoing all actions', () => {
      // Arrange
      let history = createHistory()
      const action: UndoAction = {
        type: 'add',
        field: createTestField(),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      history = pushAction(history, action)

      const undoResult = undo(history)
      if (isOk(undoResult)) {
        history = undoResult.value.history
      }

      // Act & Assert
      expect(canUndo(history)).toBe(false)
    })
  })

  describe('canRedo', () => {
    it('should return false for empty history', () => {
      // Arrange
      const history = createHistory()

      // Act & Assert
      expect(canRedo(history)).toBe(false)
    })

    it('should return false when no actions have been undone', () => {
      // Arrange
      let history = createHistory()
      const action: UndoAction = {
        type: 'add',
        field: createTestField(),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      history = pushAction(history, action)

      // Act & Assert
      expect(canRedo(history)).toBe(false)
    })

    it('should return true after undoing an action', () => {
      // Arrange
      let history = createHistory()
      const action: UndoAction = {
        type: 'add',
        field: createTestField(),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      history = pushAction(history, action)

      const undoResult = undo(history)
      if (isOk(undoResult)) {
        history = undoResult.value.history
      }

      // Act & Assert
      expect(canRedo(history)).toBe(true)
    })
  })

  describe('clearHistory', () => {
    it('should clear both past and future stacks', () => {
      // Arrange
      let history = createHistory()
      const action1: UndoAction = {
        type: 'add',
        field: createTestField({ key: 'field1' }),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      const action2: UndoAction = {
        type: 'add',
        field: createTestField({ key: 'field2' }),
        insertIndex: 1,
        inverse: { type: 'delete' },
      }

      history = pushAction(history, action1)
      history = pushAction(history, action2)

      const undoResult = undo(history)
      if (isOk(undoResult)) {
        history = undoResult.value.history
      }

      // Act
      const cleared = clearHistory(history)

      // Assert
      expect(cleared.past).toEqual([])
      expect(cleared.future).toEqual([])
    })

    it('should preserve maxSize when clearing', () => {
      // Arrange
      let history = createHistory(75)
      const action: UndoAction = {
        type: 'add',
        field: createTestField(),
        insertIndex: 0,
        inverse: { type: 'delete' },
      }
      history = pushAction(history, action)

      // Act
      const cleared = clearHistory(history)

      // Assert
      expect(cleared.maxSize).toBe(75)
    })
  })

  describe('getInverseAction', () => {
    describe('add action', () => {
      it('should return delete action as inverse', () => {
        // Arrange
        const field = createTestField()
        const action: UndoAction = {
          type: 'add',
          field,
          insertIndex: 2,
          inverse: { type: 'delete' },
        }

        // Act
        const inverse = getInverseAction(action)

        // Assert
        expect(inverse.type).toBe('delete')
        if (inverse.type === 'delete') {
          expect(inverse.field).toBe(field)
          expect(inverse.index).toBe(2)
          expect(inverse.inverse).toEqual({ type: 'add' })
        }
      })
    })

    describe('delete action', () => {
      it('should return add action as inverse', () => {
        // Arrange
        const field = createTestField()
        const action: UndoAction = {
          type: 'delete',
          field,
          index: 1,
          inverse: { type: 'add' },
        }

        // Act
        const inverse = getInverseAction(action)

        // Assert
        expect(inverse.type).toBe('add')
        if (inverse.type === 'add') {
          expect(inverse.field).toBe(field)
          expect(inverse.insertIndex).toBe(1)
          expect(inverse.inverse).toEqual({ type: 'delete' })
        }
      })
    })

    describe('update action', () => {
      it('should swap previousField and newField', () => {
        // Arrange
        const previousField = createTestField({ key: 'old_field' })
        const newField = createTestField({ key: 'new_field' })
        const action: UndoAction = {
          type: 'update',
          index: 0,
          previousField,
          newField,
          inverse: { type: 'update' },
        }

        // Act
        const inverse = getInverseAction(action)

        // Assert
        expect(inverse.type).toBe('update')
        if (inverse.type === 'update') {
          expect(inverse.index).toBe(0)
          expect(inverse.previousField).toBe(newField)
          expect(inverse.newField).toBe(previousField)
          expect(inverse.inverse).toEqual({ type: 'update' })
        }
      })
    })

    describe('reorder action', () => {
      it('should swap fromIndex and toIndex', () => {
        // Arrange
        const action: UndoAction = {
          type: 'reorder',
          fromIndex: 2,
          toIndex: 5,
          inverse: { type: 'reorder' },
        }

        // Act
        const inverse = getInverseAction(action)

        // Assert
        expect(inverse.type).toBe('reorder')
        if (inverse.type === 'reorder') {
          expect(inverse.fromIndex).toBe(5)
          expect(inverse.toIndex).toBe(2)
          expect(inverse.inverse).toEqual({ type: 'reorder' })
        }
      })
    })

    describe('duplicate action', () => {
      it('should return delete action as inverse', () => {
        // Arrange
        const field = createTestField()
        const action: UndoAction = {
          type: 'duplicate',
          insertIndex: 3,
          field,
          inverse: { type: 'delete' },
        }

        // Act
        const inverse = getInverseAction(action)

        // Assert
        expect(inverse.type).toBe('delete')
        if (inverse.type === 'delete') {
          expect(inverse.field).toBe(field)
          expect(inverse.index).toBe(3)
          expect(inverse.inverse).toEqual({ type: 'add' })
        }
      })
    })

    describe('setName action', () => {
      it('should swap previousName and newName', () => {
        // Arrange
        const action: UndoAction = {
          type: 'setName',
          previousName: 'Old Schema',
          newName: 'New Schema',
          inverse: { type: 'setName' },
        }

        // Act
        const inverse = getInverseAction(action)

        // Assert
        expect(inverse.type).toBe('setName')
        if (inverse.type === 'setName') {
          expect(inverse.previousName).toBe('New Schema')
          expect(inverse.newName).toBe('Old Schema')
          expect(inverse.inverse).toEqual({ type: 'setName' })
        }
      })
    })
  })
})
