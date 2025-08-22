import { useState, useEffect } from 'react'
import API from '../lib/api'

export default function Performance() {
  const [formData, setFormData] = useState({
    energyLevel: 3,
    sleepHours: 8,
    isTrainingDay: false,
    trainingType: '',
    notes: ''
  })
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const [weekSummary, setWeekSummary] = useState({
    avgEnergy: 0,
    avgSleep: 0,
    trainingDays: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch performance data on mount
  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const response = await API.performance.history()
      
      if (response.success && response.data) {
        // Handle the nested data structure
        const performanceData = response.data.data || response.data
        
        // Process recent entries
        const entries = (Array.isArray(performanceData) ? performanceData : []).slice(0, 7).map((entry: any) => ({
          date: new Date(entry.date),
          energyLevel: entry.energyLevel,
          sleepHours: entry.sleepHours,
          isTrainingDay: entry.isTrainingDay,
          trainingType: entry.trainingType,
          notes: entry.notes
        }))
        setRecentEntries(entries)

        // Calculate week summary
        if (entries.length > 0) {
          const avgEnergy = entries.reduce((sum: number, e: any) => sum + e.energyLevel, 0) / entries.length
          const avgSleep = entries.reduce((sum: number, e: any) => sum + e.sleepHours, 0) / entries.length
          const trainingDays = entries.filter((e: any) => e.isTrainingDay).length
          
          setWeekSummary({
            avgEnergy: Math.round(avgEnergy * 10) / 10,
            avgSleep: Math.round(avgSleep * 10) / 10,
            trainingDays
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Submitting performance data:', formData)
    
    try {
      const response = await API.performance.submit({
        ...formData,
        matchDay: false // Add missing field
      })
      
      if (response.success) {
        alert('Performance data saved successfully!')
        setFormData({
          energyLevel: 3,
          sleepHours: 8,
          isTrainingDay: false,
          trainingType: '',
          notes: ''
        })
        // Refresh data
        fetchPerformanceData()
      } else {
        console.error('API error response:', response)
        alert(response.error || response.message || 'Failed to save performance data')
      }
    } catch (error) {
      console.error('Error submitting performance data:', error)
      alert('Failed to create performance metrics')
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Performance Tracking</h1>
        <p className="text-gray-600 mt-2">Monitor your energy, sleep, and training progress</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Performance Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Today's Metrics</h2>
            <span className="text-3xl">⚡</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                Energy Level
              </label>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Low</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, energyLevel: level})}
                      className={`w-12 h-12 rounded-xl font-bold transition-all transform hover:scale-110 ${
                        formData.energyLevel >= level
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">High</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                Sleep Hours
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({...formData, sleepHours: parseFloat(e.target.value)})}
                  className="flex-1"
                />
                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg">
                  <span className="text-lg font-bold">{formData.sleepHours}h</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isTrainingDay}
                  onChange={(e) => setFormData({...formData, isTrainingDay: e.target.checked})}
                  className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Training/Match Day
                </span>
              </label>
            </div>

            {formData.isTrainingDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Training Type
                </label>
                <select
                  value={formData.trainingType}
                  onChange={(e) => setFormData({...formData, trainingType: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                >
                  <option value="">Select type...</option>
                  <option value="team_practice">Team Practice</option>
                  <option value="match">Match</option>
                  <option value="gym">Gym Session</option>
                  <option value="individual">Individual Training</option>
                  <option value="recovery">Recovery Session</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="How are you feeling today?"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Save Performance Data
            </button>
          </form>
        </div>

        <div>
          {/* Weekly Summary Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">This Week's Summary</h2>
              <span className="text-3xl">📊</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading summary...</div>
              </div>
            ) : weekSummary.avgEnergy > 0 || weekSummary.avgSleep > 0 || weekSummary.trainingDays > 0 ? (
              <div className="space-y-4">
                <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚡</span>
                      <span className="text-gray-700 font-medium">Average Energy</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">{weekSummary.avgEnergy}/5</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">😴</span>
                      <span className="text-gray-700 font-medium">Average Sleep</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{weekSummary.avgSleep}h</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏋️</span>
                      <span className="text-gray-700 font-medium">Training Days</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{weekSummary.trainingDays}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No data available yet</p>
                <p className="text-sm mt-2">Start tracking your performance to see your summary</p>
              </div>
            )}</div>

          {/* Recent Entries Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Entries</h2>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                Last 7 days
              </span>
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading entries...</div>
              </div>
            ) : recentEntries.length > 0 ? (
              <div className="space-y-3">
                {recentEntries.map((entry, index) => {
                  const dayName = entry.date.toLocaleDateString('en-US', { weekday: 'long' });
                  const daysAgo = Math.floor((Date.now() - entry.date.getTime()) / (1000 * 60 * 60 * 24));
                  const daysAgoText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
                  
                  // Determine border color based on energy level
                  const borderColor = entry.energyLevel >= 4 ? 'border-green-500' : 
                                     entry.energyLevel === 3 ? 'border-yellow-500' : 
                                     'border-red-500';
                  const bgGradient = entry.energyLevel >= 4 ? 'from-green-50' : 
                                    entry.energyLevel === 3 ? 'from-yellow-50' : 
                                    'from-red-50';
                  
                  // Training type labels
                  const trainingTypeLabels: Record<string, string> = {
                    'team_practice': '🎯 Team Practice',
                    'match': '⚽ Match Day',
                    'gym': '🏋️ Gym Session',
                    'individual': '👤 Individual Training',
                    'recovery': '💆 Recovery Session'
                  };
                  
                  return (
                    <div key={index} className={`bg-gradient-to-r ${bgGradient} to-white border-l-4 ${borderColor} rounded-lg p-4 hover:shadow-md transition-all`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">{dayName}</div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <span>⚡</span>
                              <span className="font-medium">{entry.energyLevel}/5</span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              <span>😴</span>
                              <span className="font-medium">{entry.sleepHours}h</span>
                            </span>
                          </div>
                          {entry.isTrainingDay && (
                            <div className="mt-2">
                              <span className={`text-xs ${entry.trainingType === 'match' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} px-2 py-1 rounded-full font-semibold`}>
                                {trainingTypeLabels[entry.trainingType] || '🏃 Training'}
                              </span>
                            </div>
                          )}
                          {!entry.isTrainingDay && (
                            <div className="mt-2">
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold">
                                🌴 Rest Day
                              </span>
                            </div>
                          )}
                          {entry.notes && (
                            <p className="text-xs text-gray-600 mt-2 italic">{entry.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{daysAgoText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No entries yet</p>
                <p className="text-sm mt-2">Start tracking your daily performance</p>
              </div>
            )}</div>
        </div>
      </div>
    </div>
  )
}