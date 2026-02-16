import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CreatePublishableKeyInput, KeyEnvironment } from '@/types/publishableKey'

interface PublishableKeyCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: CreatePublishableKeyInput) => void
  isLoading?: boolean
}

export function PublishableKeyCreateModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: PublishableKeyCreateModalProps) {
  const [name, setName] = useState('')
  const [environment, setEnvironment] = useState<KeyEnvironment>('test')

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({ name: name.trim(), environment })
  }

  const handleClose = () => {
    setName('')
    setEnvironment('test')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a publishable key to authenticate client SDK requests.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="key-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="key-name"
              placeholder="e.g., Production Website"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground">
              A label to help you identify this key
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key-environment">
              Environment <span className="text-destructive">*</span>
            </Label>
            <Select value={environment} onValueChange={(v) => setEnvironment(v as KeyEnvironment)}>
              <SelectTrigger id="key-environment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Test keys are for development; live keys are for production
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            isLoading={isLoading}
          >
            Create Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
