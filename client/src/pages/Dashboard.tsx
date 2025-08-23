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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.firstName || 'Athlete'}! 👋
        </h1>
        <p className="text-gray-600">
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
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Nutrition Score
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
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
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Meals Today
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.todayMeals}/5
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">🍽️</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {5 - stats.todayMeals} more meals to log
          </p>
        </div>

        {/* Energy Level Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Avg Energy
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.weekAvgEnergy}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-full ${
                  level <= Math.round(stats.weekAvgEnergy)
                    ? 'bg-yellow-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sleep Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Avg Sleep
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.sleepAvg}h
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">😴</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {stats.sleepAvg >= 8 ? 'Great sleep!' : 'Try to get more rest'}
          </p>
        </div>
          </>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/food')}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all group"
            >
              <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🍎</span>
              <span className="text-sm font-medium text-gray-700">Log Meal</span>
            </button>
            <button
              onClick={() => navigate('/performance')}
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all group"
            >
              <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">📊</span>
              <span className="text-sm font-medium text-gray-700">Track Performance</span>
            </button>
            <button
              onClick={() => navigate('/team')}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all group"
            >
              <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">👥</span>
              <span className="text-sm font-medium text-gray-700">Team View</span>
            </button>
            <button
              className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg hover:shadow-md transition-all group"
            >
              <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">📈</span>
              <span className="text-sm font-medium text-gray-700">View Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🥗</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Lunch logged</p>
                <p className="text-xs text-gray-500">Healthy choices • 2 hours ago</p>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +15 pts
              </span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Energy level updated</p>
                <p className="text-xs text-gray-500">Feeling great! • This morning</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                4/5
              </span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg">😴</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Sleep tracked</p>
                <p className="text-xs text-gray-500">Good rest • Yesterday</p>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                8h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Keep up the great work! 🏆</h3>
            <p className="text-blue-100">
              You're on track to achieve your nutrition goals this week. 
              Just {5 - stats.todayMeals} more meals to log today!
            </p>
          </div>
          <div className="text-6xl opacity-20">
            🎯
          </div>
        </div>
      </div>
    </div>
  )
}