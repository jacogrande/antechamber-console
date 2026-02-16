import { MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import type { PublishableKey } from '@/types/publishableKey'
import { formatDate } from '@/lib/utils'
import { KeyEnvironmentBadge } from './KeyEnvironmentBadge'

interface PublishableKeyRowProps {
  publishableKey: PublishableKey
  onRevoke: (key: PublishableKey) => void
}

export function PublishableKeyRow({ publishableKey, onRevoke }: PublishableKeyRowProps) {
  return (
    <TableRow>
      <TableCell>
        <span className="font-medium">{publishableKey.name}</span>
      </TableCell>
      <TableCell>
        <code className="text-sm font-mono text-muted-foreground">
          {publishableKey.keyPrefix}...
        </code>
      </TableCell>
      <TableCell>
        <KeyEnvironmentBadge environment={publishableKey.environment} />
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {publishableKey.lastUsedAt ? formatDate(publishableKey.lastUsedAt) : 'Never'}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formatDate(publishableKey.createdAt)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onRevoke(publishableKey)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Revoke
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
