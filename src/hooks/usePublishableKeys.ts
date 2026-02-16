import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listPublishableKeys,
  createPublishableKey,
  revokePublishableKey,
} from '@/lib/api/publishableKeys'
import type { CreatePublishableKeyInput } from '@/types/publishableKey'

export const publishableKeyKeys = {
  all: ['publishableKeys'] as const,
  lists: () => [...publishableKeyKeys.all, 'list'] as const,
  list: () => [...publishableKeyKeys.lists()] as const,
}

export function usePublishableKeys() {
  return useQuery({
    queryKey: publishableKeyKeys.list(),
    queryFn: listPublishableKeys,
  })
}

export function useCreatePublishableKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePublishableKeyInput) => createPublishableKey(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: publishableKeyKeys.lists() })
    },
  })
}

export function useRevokePublishableKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => revokePublishableKey(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: publishableKeyKeys.lists() })
    },
  })
}
