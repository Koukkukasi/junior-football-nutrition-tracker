import { useState } from 'react'

export default function Performance() {
  const [formData, setFormData] = useState({
    energyLevel: 3,
    sleepHours: 8,
    isTrainingDay: false,
    trainingType: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Performance data:', formData)
    // TODO: Send to API
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
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span className="text-gray-700 font-medium">Average Energy</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">4.2/5</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">😴</span>
                    <span className="text-gray-700 font-medium">Average Sleep</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">7.5h</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏋️</span>
                    <span className="text-gray-700 font-medium">Training Days</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Entries Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Entries</h2>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                Last 7 days
              </span>
            </div>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-50 to-white border-l-4 border-green-500 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Monday</div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <span>⚡</span>
                        <span className="font-medium">5/5</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <span>😴</span>
                        <span className="font-medium">8h</span>
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                        ⚽ Match Day
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-white border-l-4 border-yellow-500 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Sunday</div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <span>⚡</span>
                        <span className="font-medium">3/5</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <span>😴</span>
                        <span className="font-medium">6.5h</span>
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold">
                        🌴 Rest Day
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Saturday</div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <span>⚡</span>
                        <span className="font-medium">4/5</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <span>😴</span>
                        <span className="font-medium">7h</span>
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                        🎯 Team Practice
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">4 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}