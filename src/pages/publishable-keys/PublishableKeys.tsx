import { useState } from 'react'
import { toast } from 'sonner'
import { Key, Plus } from 'lucide-react'
import { usePublishableKeys, useCreatePublishableKey } from '@/hooks/usePublishableKeys'
import { useDisclosure } from '@/hooks/useDisclosure'
import {
  PublishableKeyTable,
  PublishableKeyCreateModal,
  PublishableKeySecretModal,
} from '@/components/publishable-keys'
import { EmptyState, LoadingSpinner, RetryableAlert } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { CreatePublishableKeyInput, PublishableKeyWithRawKey } from '@/types/publishableKey'

export function PublishableKeys() {
  const { data: keys, isLoading, error, refetch, isFetching } = usePublishableKeys()
  const createKey = useCreatePublishableKey()
  const createModal = useDisclosure()
  const secretModal = useDisclosure()
  const [createdKey, setCreatedKey] = useState<PublishableKeyWithRawKey | null>(null)

  const handleCreateSubmit = (input: CreatePublishableKeyInput) => {
    void createKey
      .mutateAsync(input)
      .then((key) => {
        setCreatedKey(key)
        createModal.onClose()
        secretModal.onOpen()
      })
      .catch((err: Error) => {
        toast.error('Failed to create API key', {
          description: err.message || 'Please try again.',
        })
      })
  }

  const handleSecretClose = () => {
    setCreatedKey(null)
    secretModal.onClose()
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <RetryableAlert
        message="Failed to load API keys. Please try again."
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  const hasKeys = keys && keys.length > 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">API Keys</h1>
        {hasKeys && (
          <Button onClick={createModal.onOpen}>
            <Plus className="h-4 w-4 mr-2" />
            Create Key
          </Button>
        )}
      </div>

      {hasKeys ? (
        <PublishableKeyTable keys={keys} />
      ) : (
        <EmptyState
          icon={Key}
          title="No API keys yet"
          description="Create a publishable key to authenticate your client SDK integration."
          actionLabel="Create Key"
          onAction={createModal.onOpen}
        />
      )}

      <PublishableKeyCreateModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSubmit={handleCreateSubmit}
        isLoading={createKey.isPending}
      />

      {createdKey && (
        <PublishableKeySecretModal
          isOpen={secretModal.isOpen}
          onClose={handleSecretClose}
          rawKey={createdKey.rawKey}
        />
      )}
    </div>
  )
}
