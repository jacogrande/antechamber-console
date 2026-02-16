import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CopyButton } from '@/components/common'

interface PublishableKeySecretModalProps {
  isOpen: boolean
  onClose: () => void
  rawKey: string
}

export function PublishableKeySecretModal({ isOpen, onClose, rawKey }: PublishableKeySecretModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>API Key Created</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertTitle className="text-amber-800 dark:text-amber-400">
              Save your API key
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              This key will only be shown once. Store it securely in your application.
            </AlertDescription>
          </Alert>

          <div className="bg-muted rounded-md p-3 border">
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono break-all flex-1">
                {rawKey}
              </code>
              <CopyButton value={rawKey} label="Copy key" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
