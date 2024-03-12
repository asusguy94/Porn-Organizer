'use client'

import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'react-toastify'

const onError = () => {
  toast.error('Network Error', { autoClose: false })
}

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: 'always',
      staleTime: Infinity
    }
  },
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({ onError })
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
