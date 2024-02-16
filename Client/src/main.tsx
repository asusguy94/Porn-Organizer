import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.tsx'

import './styles/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('No root element found')

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: 'always',
      staleTime: Infinity
    }
  }
})

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
