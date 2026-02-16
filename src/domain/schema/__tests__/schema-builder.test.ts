import { describe, it, expect } from 'vitest'
import {
  generateKey,
  getDefaultLabel,
  createField,
  addField,
  removeField,
  updateField,
  reorderField,
  duplicateField,
  setName,
  selectField,
  loadSchema,
  markClean,
  reset,
  type SchemaBuilderState,
} from '@/domain/schema/services/schema-builder'
import type { FieldDefinition } from '@/types/schema'
import { isOk, isErr } from '@/lib/utils/result'

// Test fixture
const createTestState = (overrides: Partial<SchemaBuilderState> = {}): SchemaBuilderState => ({
  name: '',
  fields: [],
  selectedIndex: null,
  isDirty: false,
  ...overrides,
})

const createTestField = (overrides: Partial<FieldDefinition> = {}): FieldDefinition => ({
  key: 'test_field',
  label: 'Test Field',
  type: 'string',
  required: false,
  instructions: '',
  ...overrides,
})

describe('schema-builder', () => {
  describe('generateKey', () => {
    it('should convert label to snake_case', () => {
      // Arrange & Act
      const key = generateKey('Company Name')

      // Assert
      expect(key).toBe('company_name')
    })

    it('should remove special characters', () => {
      // Arrange & Act
      const key = generateKey('Email@Address!')

      // Assert
      expect(key).toBe('email_address')
    })

    it('should strip leading underscores', () => {
      // Arrange & Act
      const key = generateKey('___Field Name')

      // Assert
      expect(key).toBe('field_name')
    })

    it('should strip trailing underscores', () => {
      // Arrange & Act
      const key = generateKey('Field Name___')

      // Assert
      expect(key).toBe('field_name')
    })

    it('should truncate to 100 characters', () => {
      // Arrange
      const longLabel = 'a'.repeat(150)

      // Act
      const key = generateKey(longLabel)

      // Assert
      expect(key).toHaveLength(100)
    })

    it('should handle multiple spaces', () => {
      // Arrange & Act
      const key = generateKey('First   Middle   Last')

      // Assert
      expect(key).toBe('first_middle_last')
    })

    it('should handle mixed case and numbers', () => {
      // Arrange & Act
      const key = generateKey('Field123Name')

      // Assert
      expect(key).toBe('field123name')
    })
  })

  describe('getDefaultLabel', () => {
    it('should return correct label for string type', () => {
      // Arrange & Act
      const label = getDefaultLabel('string')

      // Assert
      expect(label).toBe('New Text Field')
    })

    it('should return correct label for number type', () => {
      // Arrange & Act
      const label = getDefaultLabel('number')

      // Assert
      expect(label).toBe('New Number Field')
    })

    it('should return correct label for boolean type', () => {
      // Arrange & Act
      const label = getDefaultLabel('boolean')

      // Assert
      expect(label).toBe('New Yes/No Field')
    })

    it('should return correct label for enum type', () => {
      // Arrange & Act
      const label = getDefaultLabel('enum')

      // Assert
      expect(label).toBe('New Choice Field')
    })

    it('should return correct label for string array type', () => {
      // Arrange & Act
      const label = getDefaultLabel('string[]')

      // Assert
      expect(label).toBe('New List Field')
    })
  })

  describe('createField', () => {
    it('should create field with default label and key', () => {
      // Arrange & Act
      const field = createField('string', [])

      // Assert
      expect(field.label).toBe('New Text Field')
      expect(field.key).toBe('new_text_field')
      expect(field.type).toBe('string')
      expect(field.required).toBe(false)
      expect(field.instructions).toBe('')
    })

    it('should handle key collision by appending counter', () => {
      // Arrange
      const existingKeys = ['new_text_field']

      // Act
      const field = createField('string', existingKeys)

      // Assert
      expect(field.label).toBe('New Text Field 2')
      expect(field.key).toBe('new_text_field_2')
    })

    it('should handle multiple key collisions', () => {
      // Arrange
      const existingKeys = ['new_text_field', 'new_text_field_2', 'new_text_field_3']

      // Act
      const field = createField('string', existingKeys)

      // Assert
      expect(field.label).toBe('New Text Field 4')
      expect(field.key).toBe('new_text_field_4')
    })

    it('should add enumOptions for enum type', () => {
      // Arrange & Act
      const field = createField('enum', [])

      // Assert
      expect(field.enumOptions).toEqual(['Option 1', 'Option 2'])
    })

    it('should not add enumOptions for non-enum types', () => {
      // Arrange & Act
      const field = createField('string', [])

      // Assert
      expect(field.enumOptions).toBeUndefined()
    })
  })

  describe('addField', () => {
    it('should append field to empty state', () => {
      // Arrange
      const state = createTestState()

      // Act
      const result = addField(state, 'string')

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.fields).toHaveLength(1)
        expect(result.value.state.selectedIndex).toBe(0)
        expect(result.value.state.isDirty).toBe(true)
        expect(result.value.field.type).toBe('string')
      }
    })

    it('should append field to existing fields', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField({ key: 'field1' })],
      })

      // Act
      const result = addField(state, 'number')

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.fields).toHaveLength(2)
        expect(result.value.state.selectedIndex).toBe(1)
        expect(result.value.field.type).toBe('number')
      }
    })

    it('should set selectedIndex to last field', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
        ],
        selectedIndex: 0,
      })

      // Act
      const result = addField(state, 'boolean')

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.selectedIndex).toBe(2)
      }
    })
  })

  describe('removeField', () => {
    it('should return error for invalid index', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
      })

      // Act
      const result = removeField(state, 5)

      // Assert
      expect(isErr(result)).toBe(true)
    })

    it('should remove field at index', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
          createTestField({ key: 'field3' }),
        ],
      })

      // Act
      const result = removeField(state, 1)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.fields).toHaveLength(2)
        expect(result.value.state.fields[0].key).toBe('field1')
        expect(result.value.state.fields[1].key).toBe('field3')
        expect(result.value.field.key).toBe('field2')
        expect(result.value.index).toBe(1)
      }
    })

    it('should adjust selectedIndex when removing selected field', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
          createTestField({ key: 'field3' }),
        ],
        selectedIndex: 1,
      })

      // Act
      const result = removeField(state, 1)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.selectedIndex).toBe(1)
      }
    })

    it('should set selectedIndex to null when removing last field', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
        selectedIndex: 0,
      })

      // Act
      const result = removeField(state, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.selectedIndex).toBe(null)
      }
    })

    it('should decrement selectedIndex when removing field before selected', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
          createTestField({ key: 'field3' }),
        ],
        selectedIndex: 2,
      })

      // Act
      const result = removeField(state, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.selectedIndex).toBe(1)
      }
    })

    it('should set isDirty to true', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
        isDirty: false,
      })

      // Act
      const result = removeField(state, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.isDirty).toBe(true)
      }
    })
  })

  describe('updateField', () => {
    it('should return error for invalid index', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
      })

      // Act
      const result = updateField(state, 5, { label: 'New Label' })

      // Assert
      expect(isErr(result)).toBe(true)
    })

    it('should update field properties', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField({ key: 'field1', label: 'Original' })],
      })

      // Act
      const result = updateField(state, 0, { required: true, instructions: 'Help text' })

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.fields[0].required).toBe(true)
        expect(result.value.state.fields[0].instructions).toBe('Help text')
        expect(result.value.previousField.required).toBe(false)
      }
    })

    it('should auto-generate key from label when label changes and key matches old auto-generated key', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField({ key: 'original_label', label: 'Original Label' })],
      })

      // Act
      const result = updateField(state, 0, { label: 'New Label' })

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.fields[0].key).toBe('new_label')
        expect(result.value.state.fields[0].label).toBe('New Label')
      }
    })

    it('should not auto-generate key when new key would collide with another field', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'original_label', label: 'Original Label' }),
          createTestField({ key: 'new_label', label: 'Other Field' }),
        ],
      })

      // Act
      const result = updateField(state, 0, { label: 'New Label' })

      // Assert - should keep old key since 'new_label' already exists on field at index 1
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.fields[0].key).toBe('original_label')
        expect(result.value.state.fields[0].label).toBe('New Label')
      }
    })

    it('should not auto-generate key if key was manually set', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField({ key: 'custom_key', label: 'Original Label' })],
      })

      // Act
      const result = updateField(state, 0, { label: 'New Label' })

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.fields[0].key).toBe('custom_key')
      }
    })

    it('should return error for duplicate key', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
        ],
      })

      // Act
      const result = updateField(state, 0, { key: 'field2' })

      // Assert
      expect(isErr(result)).toBe(true)
    })

    it('should allow updating to same key', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField({ key: 'field1' })],
      })

      // Act
      const result = updateField(state, 0, { key: 'field1', label: 'Updated' })

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.fields[0].key).toBe('field1')
      }
    })

    it('should set isDirty to true', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
        isDirty: false,
      })

      // Act
      const result = updateField(state, 0, { label: 'Updated' })

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.isDirty).toBe(true)
      }
    })
  })

  describe('reorderField', () => {
    it('should return error for invalid fromIndex', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
      })

      // Act
      const result = reorderField(state, 5, 0)

      // Assert
      expect(isErr(result)).toBe(true)
    })

    it('should return error for invalid toIndex', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
      })

      // Act
      const result = reorderField(state, 0, 5)

      // Assert
      expect(isErr(result)).toBe(true)
    })

    it('should return same state when fromIndex equals toIndex', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
      })

      // Act
      const result = reorderField(state, 0, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(state)
      }
    })

    it('should move field forward', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
          createTestField({ key: 'field3' }),
        ],
      })

      // Act
      const result = reorderField(state, 0, 2)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.fields[0].key).toBe('field2')
        expect(result.value.fields[1].key).toBe('field3')
        expect(result.value.fields[2].key).toBe('field1')
      }
    })

    it('should move field backward', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
          createTestField({ key: 'field3' }),
        ],
      })

      // Act
      const result = reorderField(state, 2, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.fields[0].key).toBe('field3')
        expect(result.value.fields[1].key).toBe('field1')
        expect(result.value.fields[2].key).toBe('field2')
      }
    })

    it('should update selectedIndex when moving selected field', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
          createTestField({ key: 'field3' }),
        ],
        selectedIndex: 0,
      })

      // Act
      const result = reorderField(state, 0, 2)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.selectedIndex).toBe(2)
      }
    })

    it('should set isDirty to true', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
        ],
        isDirty: false,
      })

      // Act
      const result = reorderField(state, 0, 1)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.isDirty).toBe(true)
      }
    })
  })

  describe('duplicateField', () => {
    it('should return error for invalid index', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
      })

      // Act
      const result = duplicateField(state, 5)

      // Assert
      expect(isErr(result)).toBe(true)
    })

    it('should create copy with _copy suffix', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField({ key: 'original', label: 'Original Field' })],
      })

      // Act
      const result = duplicateField(state, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.field.key).toBe('original_copy')
        expect(result.value.field.label).toBe('Original Field (Copy)')
      }
    })

    it('should handle naming collisions', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'original' }),
          createTestField({ key: 'original_copy' }),
        ],
      })

      // Act
      const result = duplicateField(state, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.field.key).toBe('original_copy_2')
      }
    })

    it('should insert duplicate after original', () => {
      // Arrange
      const state = createTestState({
        fields: [
          createTestField({ key: 'field1' }),
          createTestField({ key: 'field2' }),
        ],
      })

      // Act
      const result = duplicateField(state, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.insertIndex).toBe(1)
        expect(result.value.state.fields).toHaveLength(3)
        expect(result.value.state.fields[1].key).toBe('field1_copy')
      }
    })

    it('should set selectedIndex to duplicated field', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
        selectedIndex: 0,
      })

      // Act
      const result = duplicateField(state, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.selectedIndex).toBe(1)
      }
    })

    it('should set isDirty to true', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
        isDirty: false,
      })

      // Act
      const result = duplicateField(state, 0)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.state.isDirty).toBe(true)
      }
    })
  })

  describe('setName', () => {
    it('should update schema name', () => {
      // Arrange
      const state = createTestState({ name: 'Old Name' })

      // Act
      const result = setName(state, 'New Name')

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.name).toBe('New Name')
      }
    })

    it('should set isDirty to true', () => {
      // Arrange
      const state = createTestState({ isDirty: false })

      // Act
      const result = setName(state, 'New Name')

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.isDirty).toBe(true)
      }
    })
  })

  describe('selectField', () => {
    it('should set selectedIndex', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField(), createTestField()],
        selectedIndex: 0,
      })

      // Act
      const result = selectField(state, 1)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.selectedIndex).toBe(1)
      }
    })

    it('should allow setting selectedIndex to null', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
        selectedIndex: 0,
      })

      // Act
      const result = selectField(state, null)

      // Assert
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value.selectedIndex).toBe(null)
      }
    })

    it('should return error for invalid index', () => {
      // Arrange
      const state = createTestState({
        fields: [createTestField()],
      })

      // Act
      const result = selectField(state, 5)

      // Assert
      expect(isErr(result)).toBe(true)
    })
  })

  describe('loadSchema', () => {
    it('should initialize state with schema data', () => {
      // Arrange
      const fields = [
        createTestField({ key: 'field1' }),
        createTestField({ key: 'field2' }),
      ]

      // Act
      const state = loadSchema('Test Schema', fields)

      // Assert
      expect(state.name).toBe('Test Schema')
      expect(state.fields).toBe(fields)
      expect(state.selectedIndex).toBe(0)
      expect(state.isDirty).toBe(false)
    })

    it('should set selectedIndex to null for empty fields', () => {
      // Arrange & Act
      const state = loadSchema('Empty Schema', [])

      // Assert
      expect(state.selectedIndex).toBe(null)
    })
  })

  describe('markClean', () => {
    it('should clear isDirty flag', () => {
      // Arrange
      const state = createTestState({ isDirty: true })

      // Act
      const result = markClean(state)

      // Assert
      expect(result.isDirty).toBe(false)
    })

    it('should preserve other state properties', () => {
      // Arrange
      const state = createTestState({
        name: 'Test',
        fields: [createTestField()],
        selectedIndex: 0,
        isDirty: true,
      })

      // Act
      const result = markClean(state)

      // Assert
      expect(result.name).toBe('Test')
      expect(result.fields).toHaveLength(1)
      expect(result.selectedIndex).toBe(0)
    })
  })

  describe('reset', () => {
    it('should return empty initial state', () => {
      // Arrange & Act
      const state = reset()

      // Assert
      expect(state.name).toBe('')
      expect(state.fields).toEqual([])
      expect(state.selectedIndex).toBe(null)
      expect(state.isDirty).toBe(false)
    })
  })
})
