import { useState } from 'react'
import { analyzeFoodQuality, getFoodRecommendations, totalKeywordCount } from '../lib/food-database'
import { useUserProfile } from '../contexts/UserContext'

type MealType = 'BREAKFAST' | 'SNACK' | 'LUNCH' | 'DINNER' | 'EVENING_SNACK'

interface FoodEntry {
  id: string
  mealType: MealType
  time: string
  location: string
  description: string
  notes?: string
  quality?: 'poor' | 'fair' | 'good' | 'excellent'
}

export default function FoodLog() {
  const { profile } = useUserProfile()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    mealType: 'BREAKFAST' as MealType,
    time: '',
    location: '',
    description: '',
    notes: ''
  })

  // Helper to determine meal timing context
  const getMealTiming = (mealType: MealType, time: string): 'pre-game' | 'post-game' | 'regular' => {
    // This could be enhanced with actual game schedule
    // For now, we'll use simple logic
    const hour = parseInt(time.split(':')[0])
    
    // Assume games are typically in afternoon (14:00-18:00)
    if (mealType === 'LUNCH' && hour >= 11 && hour <= 13) {
      return 'pre-game' // Lunch before afternoon game
    } else if (mealType === 'DINNER' && hour >= 18 && hour <= 20) {
      return 'post-game' // Dinner after game
    }
    return 'regular'
  }

  const [todayEntries, setTodayEntries] = useState<FoodEntry[]>([
    {
      id: '1',
      mealType: 'BREAKFAST',
      time: '08:00',
      location: 'Home',
      description: 'Oatmeal with berries, 2 eggs, orange juice',
      notes: 'Good energy after breakfast',
      quality: 'excellent'
    },
    {
      id: '2',
      mealType: 'LUNCH',
      time: '12:30',
      location: 'School',
      description: 'Chicken sandwich, apple, water',
      quality: 'good'
    }
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const timing = getMealTiming(formData.mealType as MealType, formData.time)
    const analysis = analyzeFoodQuality(
      formData.description, 
      timing,
      profile?.age,
      profile?.ageGroup
    )
    
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      ...formData,
      quality: analysis.quality
    }
    setTodayEntries([...todayEntries, newEntry])
    
    // Show suggestions in console (could be displayed in UI)
    if (analysis.suggestions.length > 0) {
      console.log('Nutrition tips:', analysis.suggestions)
      console.log('Age bonus applied:', analysis.ageBonus)
    }
    
    setFormData({
      mealType: 'BREAKFAST',
      time: '',
      location: '',
      description: '',
      notes: ''
    })
    setShowForm(false)
  }

  const mealTypeLabels = {
    BREAKFAST: { label: 'Breakfast', icon: '🌅' },
    SNACK: { label: 'Snack', icon: '🥨' },
    LUNCH: { label: 'Lunch', icon: '☀️' },
    DINNER: { label: 'Dinner', icon: '🌙' },
    EVENING_SNACK: { label: 'Evening Snack', icon: '🌃' }
  }

  const calculateNutritionScore = () => {
    if (todayEntries.length === 0) return 0
    
    const qualityPoints = {
      'excellent': 100,
      'good': 75,
      'fair': 50,
      'poor': 0  // Changed from 25 to 0 for stronger impact
    }
    
    const totalPoints = todayEntries.reduce((sum, entry) => 
      sum + (qualityPoints[entry.quality || 'fair']), 0
    )
    
    // Score based on both quantity (meals logged) and quality
    const quantityScore = (todayEntries.length / 5) * 40 // 40% weight for eating regularly
    const qualityScore = (totalPoints / (todayEntries.length * 100)) * 60 // 60% weight for quality (more important)
    
    return Math.round(quantityScore + qualityScore)
  }

  const nutritionScore = calculateNutritionScore()
  
  const getScoreColor = () => {
    if (nutritionScore >= 81) return '#10b981' // green - Excellent
    if (nutritionScore >= 61) return '#2563eb' // blue - Good
    if (nutritionScore >= 41) return '#f59e0b' // yellow - Fair
    return '#ef4444' // red - Needs improvement
  }

  const getScoreText = () => {
    if (nutritionScore >= 81) return 'Excellent!'
    if (nutritionScore >= 61) return 'Good'
    if (nutritionScore >= 41) return 'Fair'
    return 'Needs Improvement'
  }

  const getQualityColor = (quality?: string) => {
    switch(quality) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'fair': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getQualityLabel = (quality?: string) => {
    switch(quality) {
      case 'excellent': return '⭐ Excellent'
      case 'good': return '✓ Good'
      case 'fair': return '⚡ Fair'
      case 'poor': return '⚠️ Poor'
      default: return '? Unknown'
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Food Log</h1>
          <p className="text-gray-600 mt-2">Track your daily nutrition intake</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>Add Meal</span>
        </button>
      </div>

      {/* Daily Nutrition Score Card - Modern Design */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Daily Nutrition Score</h2>
              <p className="text-sm text-gray-600">{todayEntries.length}/5 meals logged today</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <span className="text-3xl">📊</span>
            </div>
          </div>
        </div>

        {/* Modern Score Display */}
        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-4xl font-bold text-gray-800">{nutritionScore}</span>
              <span className="text-xl text-gray-500">/100</span>
            </div>
            <span 
              className="px-5 py-2.5 rounded-full text-white font-bold text-sm uppercase tracking-wider shadow-md"
              style={{ backgroundColor: getScoreColor() }}
            >
              {getScoreText()}
            </span>
          </div>
          
          {/* Main Color Bar */}
          <div 
            className="relative w-full rounded-full overflow-hidden shadow-inner"
            style={{ 
              height: '60px',
              background: 'linear-gradient(to right, #ef4444 0%, #ef4444 40%, #f59e0b 41%, #f59e0b 60%, #2563eb 61%, #2563eb 80%, #10b981 81%, #10b981 100%)',
              border: '2px solid #e5e7eb'
            }}
          >
            {/* Position Indicator */}
            <div 
              className="absolute top-1/2 flex flex-col items-center"
              style={{ 
                left: `${nutritionScore}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {nutritionScore}
              </div>
              <div className="w-1 h-8 bg-black"></div>
            </div>

            {/* Zone Labels */}
            <div className="absolute inset-0 flex items-center justify-between px-6 text-white font-bold">
              <span style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>POOR</span>
              <span style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>FAIR</span>
              <span style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>GOOD</span>
              <span style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>EXCELLENT</span>
            </div>
          </div>

          {/* Score Ranges */}
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">How Scoring Works</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Meal Frequency</div>
                <div className="text-xs text-gray-600 mt-1">40% weight • Target: 5 meals/day</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Food Quality</div>
                <div className="text-xs text-gray-600 mt-1">60% weight • Nutritious choices (priority)</div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex gap-2">
              <span className="text-lg">💡</span>
              <div className="text-sm text-gray-700">
                <strong className="text-gray-800">Pro Tip:</strong> Include proteins, vegetables, fruits, and whole grains for higher scores. 
                Avoid excessive sweets, chips, and soda.
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Log a Meal</h2>
            <span className="text-3xl">🍽️</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Type
                </label>
                <select
                  value={formData.mealType}
                  onChange={(e) => setFormData({...formData, mealType: e.target.value as MealType})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                >
                  {Object.entries(mealTypeLabels).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.icon} {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Home, School, Restaurant"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What did you eat?
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your meal..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="How did you feel after eating?"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                Save Meal
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Today's Meals List - Modern Design */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Today's Meals</h2>
            <span className="text-sm text-gray-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="divide-y">
          {todayEntries.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No meals logged today. Start by adding your first meal!
            </div>
          ) : (
            todayEntries.map((entry) => (
              <div key={entry.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {mealTypeLabels[entry.mealType].icon}
                      </span>
                      <span className="font-medium">
                        {mealTypeLabels[entry.mealType].label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {entry.time} • {entry.location}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getQualityColor(entry.quality)}`}>
                        {getQualityLabel(entry.quality)}
                      </span>
                    </div>
                    <p className="text-gray-700">{entry.description}</p>
                    {entry.notes && (
                      <p className="text-sm text-gray-500 mt-1">📝 {entry.notes}</p>
                    )}
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Food Recommendations Section */}
      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        {/* Smart Food Suggestions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Smart Food Suggestions</h3>
            <span className="text-2xl">💡</span>
          </div>
          <div className="space-y-3">
            {getFoodRecommendations(
              new Date().getHours() < 12 ? 'morning' : 
              new Date().getHours() < 17 ? 'afternoon' : 'evening',
              false, // This could be connected to actual training schedule
              todayEntries.length > 0 ? todayEntries[todayEntries.length - 1].quality : undefined
            ).map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Database Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Nutrition Intelligence</h3>
            <span className="text-2xl">🧠</span>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Food Database Size</span>
                <span className="text-lg font-bold text-blue-600">{totalKeywordCount}+ foods</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Sports-Specific Foods</span>
                <span className="text-lg font-bold text-green-600">✅ Included</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Finnish Foods</span>
                <span className="text-lg font-bold text-purple-600">🇫🇮 Supported</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <p>✨ AI-powered analysis includes timing-based recommendations and age-specific guidance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}