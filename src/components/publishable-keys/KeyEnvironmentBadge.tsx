import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { KeyEnvironment } from '@/types/publishableKey'

interface KeyEnvironmentBadgeProps {
  environment: KeyEnvironment
}

export function KeyEnvironmentBadge({ environment }: KeyEnvironmentBadgeProps) {
  return (
    <Badge
      variant={environment === 'live' ? 'default' : 'secondary'}
      className="px-2 py-0.5"
    >
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            environment === 'live' ? 'bg-green-500' : 'bg-muted-foreground'
          )}
        />
        <span>{environment}</span>
      </span>
    </Badge>
  )
}
