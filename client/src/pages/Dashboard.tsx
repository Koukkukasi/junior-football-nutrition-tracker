import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../hooks/useOnboarding'
import { SkeletonDashboardCard } from '../components/ui/SkeletonLoader'

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
  const [loading, setLoading] = useState(true)
  const [, setShowDemoData] = useState(false)

  useEffect(() => {
    // Check if user is new and should see demo data
    const isNewUser = localStorage.getItem('showDemoData') === 'true'
    setShowDemoData(isNewUser)
    
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
          setStats(data.stats || {
            todayMeals: 3,
            weekAvgEnergy: 4.2,
            sleepAvg: 7.5,
            trainingDays: 4,
            nutritionScore: 75
          })
        } else {
          // Use demo values if API fails
          setStats({
            todayMeals: 3,
            weekAvgEnergy: 4.2,
            sleepAvg: 7.5,
            trainingDays: 4,
            nutritionScore: 75
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Use demo values on error
        setStats({
          todayMeals: 3,
          weekAvgEnergy: 4.2,
          sleepAvg: 7.5,
          trainingDays: 4,
          nutritionScore: 75
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
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
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreColor(stats.nutritionScore)}`}>
              {getScoreLabel(stats.nutritionScore)}
            </div>
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
              <div className="w-8 h-8 bg-white rounded-lg"></div>
            </div>
          </div>
          <p className="text-sm text-white/80 mt-4">
            {5 - stats.todayMeals} more meals to log
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
              <div className="w-8 h-8 bg-white rounded-lg"></div>
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
              <div className="w-8 h-8 bg-white rounded-lg"></div>
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
              <div className="w-10 h-10 mb-2 bg-white rounded-lg group-hover:scale-110 transition-transform mx-auto"></div>
              <span className="text-sm font-medium text-white">Log Meal</span>
            </button>
            <button
              onClick={() => navigate('/performance')}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all group border border-white/30"
            >
              <div className="w-10 h-10 mb-2 bg-white rounded-lg group-hover:scale-110 transition-transform mx-auto"></div>
              <span className="text-sm font-medium text-white">Track Performance</span>
            </button>
            <button
              onClick={() => navigate('/team')}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all group border border-white/30"
            >
              <div className="w-10 h-10 mb-2 bg-white rounded-lg group-hover:scale-110 transition-transform mx-auto"></div>
              <span className="text-sm font-medium text-white">Team View</span>
            </button>
            <button
              className="p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all group border border-white/30"
            >
              <div className="w-10 h-10 mb-2 bg-white rounded-lg group-hover:scale-110 transition-transform mx-auto"></div>
              <span className="text-sm font-medium text-white">View Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Lunch logged</p>
                <p className="text-xs text-white/70">Healthy choices • 2 hours ago</p>
              </div>
              <span className="text-xs font-semibold text-white bg-white/30 px-2 py-1 rounded-full">
                +15 pts
              </span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Energy level updated</p>
                <p className="text-xs text-white/70">Feeling great! • This morning</p>
              </div>
              <span className="text-xs font-semibold text-white bg-white/30 px-2 py-1 rounded-full">
                4/5
              </span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Sleep tracked</p>
                <p className="text-xs text-white/70">Good rest • Yesterday</p>
              </div>
              <span className="text-xs font-semibold text-white bg-white/30 px-2 py-1 rounded-full">
                8h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Card */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Keep up the great work!</h3>
            <p className="text-white/90">
              You're on track to achieve your nutrition goals this week. 
              Just {5 - stats.todayMeals} more meals to log today!
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  )
}