import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import ErrorBoundary from './components/ErrorBoundary'
import { UserProvider } from './contexts/UserContext'
import './App.css'

// Lazy load all protected pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const FoodLog = lazy(() => import('./pages/FoodLog'))
const Performance = lazy(() => import('./pages/Performance'))
const Team = lazy(() => import('./pages/Team'))
const Profile = lazy(() => import('./pages/Profile'))
const Analytics = lazy(() => import('./pages/Analytics'))
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'))
const AdminInvite = lazy(() => import('./pages/AdminInvite'))
const AdminMonitor = lazy(() => import('./pages/AdminMonitor'))
// TestInvite page removed - functionality merged into AdminInvite

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  
  if (!isLoaded) {
    return <PageLoader />
  }
  
  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { isSignedIn } = useAuth()

  return (
    <ErrorBoundary>
      <UserProvider>
        <Routes>
        <Route path="/" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
        
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <OnboardingWizard />
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/food" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <FoodLog />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Performance />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/team" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Team />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Analytics />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/admin/invite" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminInvite />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/admin/monitor" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminMonitor />
              </Suspense>
            </ProtectedRoute>
          } />
          {/* Test invite functionality now available in /admin/invite */}
        </Route>
      </Routes>
    </UserProvider>
    </ErrorBoundary>
  )
}

export default App