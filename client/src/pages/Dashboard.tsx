import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../hooks/useOnboarding'
import { SkeletonDashboardCard } from '../components/ui/SkeletonLoader'
import { Trophy, UtensilsCrossed, Zap, Moon, Plus, TrendingUp, Users, FileText, Target } from 'lucide-react'

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

export default function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  useOnboarding() // Just run the hook for its side effects
  const [stats, setStats] = useState({
    todayMeals: 0,
    weekAvgEnergy: 0,
    sleepAvg: 0,
    trainingDays: 0,
    nutritionScore: 0
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch recent food entries for activity feed
    const fetchRecentActivities = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const response = await fetch(`${API_BASE}/api/v1/food?limit=3`, {
          headers: {
            'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setRecentActivities(data.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch recent activities:', error)
      }
    }
    
    // Fetch actual stats from API
    const fetchStats = async () => {
      setLoading(true)
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const response = await fetch(`${API_BASE}/api/v1/users/stats`, {
          headers: {
            'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          // Use the actual stats from the API response
          if (data.success && data.stats) {
            setStats(data.stats)
          } else {
            // Only use demo values if no real data exists
            console.log('No real stats data, using defaults')
            setStats({
              todayMeals: 0,
              weekAvgEnergy: 0,
              sleepAvg: 0,
              trainingDays: 0,
              nutritionScore: 0
            })
          }
        } else {
          // Use zeros if API fails
          console.error('API response not ok:', response.status)
          setStats({
            todayMeals: 0,
            weekAvgEnergy: 0,
            sleepAvg: 0,
            trainingDays: 0,
            nutritionScore: 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Use zeros on error
        setStats({
          todayMeals: 0,
          weekAvgEnergy: 0,
          sleepAvg: 0,
          trainingDays: 0,
          nutritionScore: 0
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
    fetchRecentActivities()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 61) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 41) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 81) return 'Excellent'
    if (score >= 61) return 'Good'
    if (score >= 41) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || 'Athlete'}!
        </h1>
        <p className="text-white/90">
          Here's your performance overview for today
        </p>
      </div>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            <SkeletonDashboardCard />
            <SkeletonDashboardCard />
            <SkeletonDashboardCard />
            <SkeletonDashboardCard />
          </>
        ) : (
          <>
            {/* Nutrition Score Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-white/80 uppercase tracking-wider">
                Nutrition Score
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.nutritionScore}
              </p>
            </div>
            <Trophy className="w-8 h-8 text-white/80" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all"
              style={{ 
                width: `${stats.nutritionScore}%`,
                backgroundColor: stats.nutritionScore >= 81 ? '#10b981' : 
                                stats.nutritionScore >= 61 ? '#2563eb' :
                                stats.nutritionScore >= 41 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
        </div>

        {/* Meals Logged Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 uppercase tracking-wider">
                Meals Today
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.todayMeals}/5
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-sm text-white/80 mt-4">
            {5 - stats.todayMeals > 0 ? `${5 - stats.todayMeals} more meals to log` : 'All meals logged!'}
          </p>
        </div>

        {/* Energy Level Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 uppercase tracking-wider">
                Avg Energy
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.weekAvgEnergy}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-full ${
                  level <= Math.round(stats.weekAvgEnergy)
                    ? 'bg-white'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sleep Card */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 uppercase tracking-wider">
                Avg Sleep
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.sleepAvg}h
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Moon className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-sm text-white/80 mt-4">
            {stats.sleepAvg >= 8 ? 'Great sleep!' : 'Try to get more rest'}
          </p>
        </div>
          </>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/food')}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all group border border-white/30"
            >
              <Plus className="w-10 h-10 mb-2 text-white group-hover:scale-110 transition-transform mx-auto" />
              <span className="text-sm font-medium text-white">Log Meal</span>
            </button>
            <button
              onClick={() => navigate('/performance')}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all group border border-white/30"
            >
              <TrendingUp className="w-10 h-10 mb-2 text-white group-hover:scale-110 transition-transform mx-auto" />
              <span className="text-sm font-medium text-white">Track Performance</span>
            </button>
            <button
              onClick={() => navigate('/team')}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all group border border-white/30"
            >
              <Users className="w-10 h-10 mb-2 text-white group-hover:scale-110 transition-transform mx-auto" />
              <span className="text-sm font-medium text-white">Team View</span>
            </button>
            <button
              className="p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all group border border-white/30"
            >
              <FileText className="w-10 h-10 mb-2 text-white group-hover:scale-110 transition-transform mx-auto" />
              <span className="text-sm font-medium text-white">View Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: any, index: number) => {
                const mealTypeColors = {
                  BREAKFAST: 'from-yellow-400 to-yellow-600',
                  LUNCH: 'from-green-400 to-green-600',
                  DINNER: 'from-blue-400 to-blue-600',
                  SNACK: 'from-purple-400 to-purple-600',
                  EVENING_SNACK: 'from-pink-400 to-pink-600'
                }
                const color = mealTypeColors[activity.mealType as keyof typeof mealTypeColors] || 'from-gray-400 to-gray-600'
                const timeAgo = getTimeAgo(new Date(activity.createdAt || activity.date))
                
                return (
                  <div key={activity.id || index} className="flex items-center gap-4 p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <div className={`w-6 h-6 bg-gradient-to-br ${color} rounded`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{activity.mealType} logged</p>
                      <p className="text-xs text-white/70">
                        {activity.description ? `${activity.description.substring(0, 30)}${activity.description.length > 30 ? '...' : ''}` : 'No description'} • {timeAgo}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70 text-sm mb-4">No recent activity</p>
                <button 
                  onClick={() => navigate('/food')}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all"
                >
                  Log your first meal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Motivational Card */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Keep up the great work!</h3>
            <p className="text-white/90">
              {stats.todayMeals > 0 
                ? `You've logged ${stats.todayMeals} meal${stats.todayMeals > 1 ? 's' : ''} today. ${5 - stats.todayMeals > 0 ? `Just ${5 - stats.todayMeals} more to go!` : 'Great job completing all meals!'}` 
                : 'Start logging your meals to track your nutrition progress!'}
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <Target className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}