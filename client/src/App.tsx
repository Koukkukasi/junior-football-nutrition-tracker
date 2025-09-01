import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSupabaseAuth } from './contexts/SupabaseAuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import ErrorBoundary from './components/ErrorBoundary'
import { UserProvider } from './contexts/UserContext'
import { ToastProvider } from './hooks/useToast'
import { AdminOnly, CoachOrAdmin } from './components/auth/RoleGuard'
import IconTest from './components/IconTest'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import './App.css'

// Lazy load all protected pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const FoodLog = lazy(() => import('./pages/FoodLog'))
const Performance = lazy(() => import('./pages/Performance'))
const Team = lazy(() => import('./pages/Team'))
const Profile = lazy(() => import('./pages/Profile'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'))
const AdminInvite = lazy(() => import('./pages/AdminInvite'))
const AdminMonitor = lazy(() => import('./pages/AdminMonitor'))
const CoachDashboard = lazy(() => import('./pages/CoachDashboard'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TeamAccess = lazy(() => import('./pages/TeamAccess'))
const FCInterSignup = lazy(() => import('./pages/FCInterSignup'))
const AdminSignup = lazy(() => import('./pages/AdminSignup'))
const TeamDashboard = lazy(() => import('./pages/TeamDashboard'))

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
  const { user, loading } = useSupabaseAuth()
  
  if (loading) {
    return <PageLoader />
  }
  
  if (!user) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { user } = useSupabaseAuth()

  return (
    <ErrorBoundary>
      <ToastProvider>
        <UserProvider>
          <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/test-icons" element={<IconTest />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/fc-inter-signup" element={
          <Suspense fallback={<PageLoader />}>
            <FCInterSignup />
          </Suspense>
        } />
        <Route path="/admin-signup" element={
          <Suspense fallback={<PageLoader />}>
            <AdminSignup />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<PageLoader />}>
            <TermsOfService />
          </Suspense>
        } />
        <Route path="/privacy" element={
          <Suspense fallback={<PageLoader />}>
            <PrivacyPolicy />
          </Suspense>
        } />
        
        <Route path="/team-access" element={
          <Suspense fallback={<PageLoader />}>
            <TeamAccess />
          </Suspense>
        } />
        
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
          <Route path="/teams/:teamId" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <TeamDashboard />
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
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Leaderboard />
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
          <Route path="/coach-dashboard" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <CoachDashboard />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/admin/invite" element={
            <ProtectedRoute>
              <AdminOnly>
                <Suspense fallback={<PageLoader />}>
                  <AdminInvite />
                </Suspense>
              </AdminOnly>
            </ProtectedRoute>
          } />
          <Route path="/admin/monitor" element={
            <ProtectedRoute>
              <AdminOnly>
                <Suspense fallback={<PageLoader />}>
                  <AdminMonitor />
                </Suspense>
              </AdminOnly>
            </ProtectedRoute>
          } />
          <Route path="/coach/dashboard" element={
            <ProtectedRoute>
              <CoachOrAdmin>
                <Suspense fallback={<PageLoader />}>
                  <CoachDashboard />
                </Suspense>
              </CoachOrAdmin>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
        </UserProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App