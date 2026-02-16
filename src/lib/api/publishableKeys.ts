import { apiGet, apiPost, apiDelete } from './client'
import type {
  PublishableKey,
  PublishableKeyWithRawKey,
  CreatePublishableKeyInput,
} from '@/types/publishableKey'

interface KeysListResponse {
  keys: PublishableKey[]
}

interface CreateKeyResponse {
  key: PublishableKeyWithRawKey
}

export async function listPublishableKeys(): Promise<PublishableKey[]> {
  const response = await apiGet<KeysListResponse>('/publishable-keys')
  return response.keys
}

export async function createPublishableKey(
  input: CreatePublishableKeyInput,
): Promise<PublishableKeyWithRawKey> {
  const response = await apiPost<CreateKeyResponse>('/publishable-keys', input)
  return response.key
}

export async function revokePublishableKey(id: string): Promise<void> {
  await apiDelete(`/publishable-keys/${id}`)
}
