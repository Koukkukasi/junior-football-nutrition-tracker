import { Outlet, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import FeedbackWidget from './feedback/FeedbackWidget'
import { useUserProfile } from '../contexts/UserContext'
import { Menu, X, Home, UtensilsCrossed, TrendingUp, BarChart3, Users, User, Shield, LogOut, Trophy } from 'lucide-react'
import type { FoodEntry } from '../types/food.types'
// import { calculateNutritionScore } from '../utils/foodUtils' // Will be imported dynamically

export default function Layout() {
  const { user, signOut } = useSupabaseAuth()
  const { profile } = useUserProfile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [todayStats, setTodayStats] = useState({
    meals: 0,
    score: 0,
    energy: 0
  })

  // Fetch today's stats for sidebar
  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        // Use Supabase directly to get today's stats
        if (!user) return
        
        const { supabaseAPI } = await import('../lib/supabase-api')
        
        // Get today's food entries
        const foodResponse = await supabaseAPI.food.getEntries()
        const today = new Date().toDateString()
        const todayMeals = (foodResponse.data || []).filter((entry: any) => 
          new Date(entry.created_at).toDateString() === today
        ).length
        
        // Get recent performance data for energy average
        const perfResponse = await supabaseAPI.performance.getEntries()
        const recentEnergy = (perfResponse.data || []).slice(0, 7)
          .map((entry: any) => entry.energy_level || 3)
        const avgEnergy = recentEnergy.length > 0 
          ? recentEnergy.reduce((a: number, b: number) => a + b, 0) / recentEnergy.length
          : 3
        
        // Calculate nutrition score from today's meals
        const { analyzeFoodQuality } = await import('../lib/food-database')
        const { calculateNutritionScore } = await import('../utils/foodUtils')
        const todayEntries = (foodResponse.data || [])
          .filter((entry: any) => new Date(entry.created_at).toDateString() === today)
          .map((entry: any) => {
            // Re-analyze the description to get the quality
            const analysis = analyzeFoodQuality(entry.description)
            return {
              ...entry,
              id: entry.id || '',
              quality: analysis.quality,
              mealType: entry.meal_type || 'LUNCH',
              time: entry.time || '',
              location: entry.location || '',
              description: entry.description || ''
            } as FoodEntry
          })
        const scoreData = calculateNutritionScore(todayEntries)
        
        setTodayStats({
          meals: todayMeals,
          score: scoreData.totalScore || 0, // Extract totalScore from the object
          energy: Math.round(avgEnergy)
        })
      } catch (error) {
        // Silently fail - stats are not critical
        console.log('Stats fetch skipped:', error)
        // Set default values if fetch fails
        setTodayStats({
          meals: 0,
          score: 0,
          energy: 3
        })
      }
    }
    
    fetchTodayStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchTodayStats, 30000)
    return () => clearInterval(interval)
  }, [user])
  
  const isAdmin = profile?.role === 'ADMIN'

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', color: 'from-blue-500 to-cyan-500', icon: Home },
    { path: '/food', label: 'Food Log', color: 'from-emerald-500 to-green-500', icon: UtensilsCrossed },
    { path: '/performance', label: 'Performance', color: 'from-amber-500 to-orange-500', icon: TrendingUp },
    { path: '/leaderboard', label: 'Leaderboard', color: 'from-yellow-500 to-amber-500', icon: Trophy },
    { path: '/analytics', label: 'Analytics', color: 'from-purple-500 to-pink-500', icon: BarChart3 },
    { path: '/team', label: 'Team', color: 'from-indigo-500 to-purple-500', icon: Users },
    { path: '/profile', label: 'Profile', color: 'from-gray-500 to-gray-600', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg z-50">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Logo and App Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                <span className="text-white font-bold">JF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Nutrition Tracker</h1>
                <p className="text-xs text-white/70">Junior Football Edition</p>
              </div>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">
                Welcome back, {user?.email?.split('@')[0] || 'Athlete'}!
              </p>
              <p className="text-xs text-white/70">
                Keep up the great work
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation - Desktop */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 shadow-xl transform transition-transform lg:translate-x-0 z-40 ${
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
                      ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                      : 'text-white/70 hover:bg-white/10'
                  }`
                }
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} opacity-80 flex items-center justify-center`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin/monitor"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? `bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md`
                      : 'text-white/70 hover:bg-white/10'
                  }`
                }
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 opacity-80 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">Admin</span>
              </NavLink>
            )}
          </div>

          {/* Quick Stats Card */}
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <h3 className="text-sm font-semibold text-white mb-3">Today's Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">Meals</span>
                <span className="text-sm font-bold text-white">{todayStats.meals}/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">Score</span>
                <span className="text-sm font-bold text-white">{todayStats.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">Energy</span>
                <span className="text-sm font-bold text-white">{todayStats.energy}/5</span>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
            <p className="text-xs font-semibold text-white mb-1">PRO TIP</p>
            <p className="text-xs text-white/80">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg lg:hidden z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 ${
                  isActive ? 'text-white' : 'text-white/50'
                }`
              }
            >
              <item.icon className="w-6 h-6 text-current" />
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