'use client'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: 'always',
      staleTime: Infinity
    }
  }
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
