import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './styles/animations.css'
import App from './App.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

// Force Clerk to use the correct domain for test keys
const getClerkFrontendApi = () => {
  if (PUBLISHABLE_KEY.startsWith('pk_test_')) {
    // Extract instance from test key and use default clerk.accounts.dev domain
    const keyParts = PUBLISHABLE_KEY.split('_')
    if (keyParts.length >= 3) {
      const instancePart = keyParts[2]
      // Decode base64 to get the actual instance name
      try {
        const decoded = atob(instancePart)
        const instanceName = decoded.replace(/\$$/, '') // Remove trailing $
        return `https://${instanceName}`
      } catch (e) {
        console.warn('Could not decode Clerk instance from key, using default')
      }
    }
  }
  return undefined // Let Clerk use default behavior for live keys
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

const frontendApi = getClerkFrontendApi()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      frontendApi={frontendApi}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
)
