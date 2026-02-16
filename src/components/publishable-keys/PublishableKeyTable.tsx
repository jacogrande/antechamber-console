import { useState } from 'react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/common'
import { useDisclosure } from '@/hooks/useDisclosure'
import type { PublishableKey } from '@/types/publishableKey'
import { PublishableKeyRow } from './PublishableKeyRow'
import { useRevokePublishableKey } from '@/hooks/usePublishableKeys'

interface PublishableKeyTableProps {
  keys: PublishableKey[]
}

export function PublishableKeyTable({ keys }: PublishableKeyTableProps) {
  const [keyToRevoke, setKeyToRevoke] = useState<PublishableKey | null>(null)
  const { isOpen: isRevokeOpen, onOpen: onRevokeOpen, onClose: onRevokeClose } = useDisclosure()
  const revokeKey = useRevokePublishableKey()

  const handleRevokeClick = (key: PublishableKey) => {
    setKeyToRevoke(key)
    onRevokeOpen()
  }

  const handleRevokeConfirm = () => {
    if (!keyToRevoke) return
    void revokeKey
      .mutateAsync(keyToRevoke.id)
      .then(() => {
        onRevokeClose()
        setKeyToRevoke(null)
        toast.success('API key revoked')
      })
      .catch((err: Error) => {
        onRevokeClose()
        setKeyToRevoke(null)
        toast.error('Failed to revoke API key', {
          description: err.message || 'Please try again.',
        })
      })
  }

  const handleRevokeClose = () => {
    onRevokeClose()
    setKeyToRevoke(null)
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <PublishableKeyRow
                key={key.id}
                publishableKey={key}
                onRevoke={handleRevokeClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        isOpen={isRevokeOpen}
        onClose={handleRevokeClose}
        onConfirm={handleRevokeConfirm}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${keyToRevoke?.name ?? 'this key'}"? Any integrations using this key will stop working immediately.`}
        confirmLabel="Revoke"
        isDestructive
        isLoading={revokeKey.isPending}
      />
    </>
  )
}
