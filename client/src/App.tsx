import { Routes, Route, Navigate } from 'react-router-dom'
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import FoodLog from './pages/FoodLog'
import Performance from './pages/Performance'
import Team from './pages/Team'
import Profile from './pages/Profile'
import LandingPage from './pages/LandingPage'
import { UserProvider } from './contexts/UserContext'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { isSignedIn } = useAuth()

  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/food" element={
            <ProtectedRoute>
              <FoodLog />
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          } />
          <Route path="/team" element={
            <ProtectedRoute>
              <Team />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </UserProvider>
  )
}

export default App