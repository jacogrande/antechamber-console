import type { FieldDefinition } from '@antechamber/types'

export type { FieldType, FieldDefinition } from '@antechamber/types'

export interface Schema {
  id: string
  tenantId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface SchemaVersion {
  id: string
  schemaId: string
  version: number
  fields: FieldDefinition[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SchemaWithVersions {
  schema: Schema
  latestVersion: SchemaVersion | null
  versions: SchemaVersion[]
}

export interface SchemasListResponse {
  schemas: Schema[]
}

export interface SchemaResponse {
  schema: Schema
  version: SchemaVersion
}

export interface SchemaVersionResponse {
  version: SchemaVersion
}
