import { Outlet, NavLink } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useState } from 'react'
import FeedbackWidget from './feedback/FeedbackWidget'

export default function Layout() {
  const { user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/food', label: 'Food Log', icon: '🍎' },
    { path: '/performance', label: 'Performance', icon: '⚡' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/team', label: 'Team', icon: '👥' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            {/* Logo and App Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">⚽</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Nutrition Tracker</h1>
                <p className="text-xs text-gray-500">Junior Football Edition</p>
              </div>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700">
                Welcome back, {user?.firstName || 'Athlete'}!
              </p>
              <p className="text-xs text-gray-500">
                Keep up the great work 💪
              </p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Sidebar Navigation - Desktop */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Quick Stats Card */}
          <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Meals</span>
                <span className="text-sm font-bold text-blue-600">3/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Score</span>
                <span className="text-sm font-bold text-green-600">75</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Energy</span>
                <span className="text-sm font-bold text-yellow-600">4/5</span>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-800 mb-1">💡 Pro Tip</p>
            <p className="text-xs text-green-700">
              Log your meals right after eating for better tracking accuracy!
            </p>
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Add padding for mobile bottom nav */}
      <div className="h-16 lg:hidden" />
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  )
}