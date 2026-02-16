export type KeyEnvironment = 'live' | 'test'

export interface PublishableKey {
  id: string
  name: string
  keyPrefix: string
  environment: KeyEnvironment
  lastUsedAt: string | null
  createdAt: string
}

export interface PublishableKeyWithRawKey extends PublishableKey {
  rawKey: string
}

export interface CreatePublishableKeyInput {
  name: string
  environment: KeyEnvironment
}
