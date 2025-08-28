import { useState, useEffect } from 'react'
import API from '../lib/api'
import { supabaseAPI } from '../lib/supabase-api'

export default function Performance() {
  const [formData, setFormData] = useState({
    energyLevel: 5,
    sleepHours: 8,
    bedTime: '22:00',
    wakeTime: '06:00',
    recoveryLevel: 3,
    hadRecoveryMeal: false,
    recoveryNotes: '',
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

  // Calculate sleep hours from bed and wake times
  const calculateSleepHours = (bedTime: string, wakeTime: string): number => {
    const [bedHour, bedMinute] = bedTime.split(':').map(Number)
    const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number)
    
    let totalMinutes = 0
    
    if (wakeHour < bedHour || (wakeHour === bedHour && wakeMinute < bedMinute)) {
      // Wake time is next day
      totalMinutes = (24 - bedHour) * 60 - bedMinute + wakeHour * 60 + wakeMinute
    } else {
      // Wake time is same day
      totalMinutes = (wakeHour - bedHour) * 60 + (wakeMinute - bedMinute)
    }
    
    return Math.round((totalMinutes / 60) * 10) / 10
  }

  // Update sleep hours when bed or wake time changes
  useEffect(() => {
    const hours = calculateSleepHours(formData.bedTime, formData.wakeTime)
    setFormData(prev => {
      if (prev.sleepHours !== hours) {
        return { ...prev, sleepHours: hours }
      }
      return prev
    })
  }, [formData.bedTime, formData.wakeTime])

  // Fetch performance data on mount
  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      // Use Supabase API directly
      const response = await supabaseAPI.performance.getEntries()
      
      if (response.success && response.data) {
        // Process recent entries from Supabase (snake_case fields)
        const entries = (Array.isArray(response.data) ? response.data : []).slice(0, 7).map((entry: any) => ({
          date: new Date(entry.date),
          energyLevel: entry.energy_level || 3,
          sleepHours: entry.sleep_hours || 8,
          bedTime: entry.bed_time || '22:00',
          wakeTime: entry.wake_time || '06:00',
          recoveryLevel: entry.recovery_level || 3,
          hadRecoveryMeal: entry.had_recovery_meal || false,
          recoveryNotes: entry.recovery_notes || '',
          isTrainingDay: entry.training_intensity ? true : false,
          trainingType: entry.training_type || '',
          notes: entry.notes || ''
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
      console.error('Failed to fetch performance data from Supabase:', error)
      // Try fallback to backend API
      try {
        const response = await API.performance.history()
        if (response.success && response.data) {
          const performanceData = response.data.data || response.data
          const entries = (Array.isArray(performanceData) ? performanceData : []).slice(0, 7).map((entry: any) => ({
            date: new Date(entry.date),
            energyLevel: entry.energyLevel || entry.energy_level || 3,
            sleepHours: entry.sleepHours || entry.sleep_hours || 8,
            bedTime: entry.bedTime || entry.bed_time || '22:00',
            wakeTime: entry.wakeTime || entry.wake_time || '06:00',
            recoveryLevel: entry.recoveryLevel || entry.recovery_level || 3,
            hadRecoveryMeal: entry.hadRecoveryMeal || entry.had_recovery_meal || false,
            recoveryNotes: entry.recoveryNotes || entry.recovery_notes || '',
            isTrainingDay: entry.isTrainingDay || (entry.training_intensity ? true : false),
            trainingType: entry.trainingType || entry.training_type || '',
            notes: entry.notes || ''
          }))
          setRecentEntries(entries)

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
      } catch (apiError) {
        console.error('Both Supabase and backend API failed:', apiError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Submitting performance data:', formData)
    
    try {
      // Try Supabase first, fallback to backend API if it fails
      let response;
      try {
        // Use Supabase directly for data persistence
        response = await supabaseAPI.performance.upsert({
          date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
          energy_level: formData.energyLevel,
          sleep_hours: formData.sleepHours,
          training_intensity: formData.isTrainingDay ? 7 : undefined,
          notes: formData.notes || formData.recoveryNotes
        });
      } catch (supabaseError) {
        console.log('Supabase failed, trying backend API:', supabaseError);
        // Fallback to backend API
        response = await API.performance.submit({
          energyLevel: formData.energyLevel,
          sleepHours: formData.sleepHours,
          bedTime: formData.bedTime,
          wakeTime: formData.wakeTime,
          recoveryLevel: formData.recoveryLevel,
          hadRecoveryMeal: formData.hadRecoveryMeal,
          recoveryNotes: formData.recoveryNotes,
          isTrainingDay: formData.isTrainingDay,
          trainingType: formData.trainingType,
          notes: formData.notes,
          matchDay: false // Add missing field
        });
      }
      
      if (response.success) {
        alert('Performance data saved successfully!')
        setFormData({
          energyLevel: 5,
          sleepHours: 8,
          bedTime: '22:00',
          wakeTime: '06:00',
          recoveryLevel: 3,
          hadRecoveryMeal: false,
          recoveryNotes: '',
          isTrainingDay: false,
          trainingType: '',
          notes: ''
        })
        // Refresh data
        fetchPerformanceData()
      } else {
        console.error('API error response:', response)
        const errorMessage = (response && 'error' in response ? response.error : null) || 
                              (response && 'message' in response ? response.message : null) || 
                              'Failed to save performance data';
        alert(errorMessage)
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
              <div className="flex flex-col gap-2">
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, energyLevel: level})}
                      className={`w-9 h-9 rounded-lg font-bold text-sm transition-all transform hover:scale-110 ${
                        formData.energyLevel >= level
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium px-2">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                Sleep Schedule
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Bed Time</label>
                  <input
                    type="time"
                    value={formData.bedTime}
                    onChange={(e) => setFormData({...formData, bedTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Wake Time</label>
                  <input
                    type="time"
                    value={formData.wakeTime}
                    onChange={(e) => setFormData({...formData, wakeTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div className="mt-2 text-center">
                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg inline-block">
                  <span className="text-lg font-bold">💤 {formData.sleepHours}h sleep</span>
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
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                How Does Your Body Feel Today?
              </label>
              <div className="space-y-3">
                {/* Simple symptom checklist instead of abstract scale */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-600 mb-2">Check any that apply:</p>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recoveryNotes?.includes('legs_heavy') || false}
                      onChange={(e) => {
                        const notes = formData.recoveryNotes || '';
                        const notesArray = notes.split(' ').filter(n => n);
                        
                        if (e.target.checked) {
                          if (!notesArray.includes('legs_heavy')) {
                            notesArray.push('legs_heavy');
                          }
                        } else {
                          const index = notesArray.indexOf('legs_heavy');
                          if (index > -1) {
                            notesArray.splice(index, 1);
                          }
                        }
                        
                        setFormData({...formData, recoveryNotes: notesArray.join(' ')});
                      }}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm">🦵 My legs feel heavy or tired</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recoveryNotes?.includes('muscles_sore') || false}
                      onChange={(e) => {
                        const notes = formData.recoveryNotes || '';
                        const notesArray = notes.split(' ').filter(n => n);
                        
                        if (e.target.checked) {
                          if (!notesArray.includes('muscles_sore')) {
                            notesArray.push('muscles_sore');
                          }
                        } else {
                          const index = notesArray.indexOf('muscles_sore');
                          if (index > -1) {
                            notesArray.splice(index, 1);
                          }
                        }
                        
                        setFormData({...formData, recoveryNotes: notesArray.join(' ')});
                      }}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm">💪 My muscles are sore</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recoveryNotes?.includes('hard_to_run') || false}
                      onChange={(e) => {
                        const notes = formData.recoveryNotes || '';
                        const notesArray = notes.split(' ').filter(n => n);
                        
                        if (e.target.checked) {
                          if (!notesArray.includes('hard_to_run')) {
                            notesArray.push('hard_to_run');
                          }
                        } else {
                          const index = notesArray.indexOf('hard_to_run');
                          if (index > -1) {
                            notesArray.splice(index, 1);
                          }
                        }
                        setFormData({...formData, recoveryNotes: notesArray.join(' ')});
                      }}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm">🏃 It would be hard to run fast today</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recoveryNotes?.includes('feel_great') || false}
                      onChange={(e) => {
                        const notes = formData.recoveryNotes || '';
                        const notesArray = notes.split(' ').filter(n => n);
                        
                        if (e.target.checked) {
                          if (!notesArray.includes('feel_great')) {
                            notesArray.push('feel_great');
                          }
                          // If feeling great, calculate better recovery level
                          setFormData(prev => ({...prev, recoveryLevel: 5, recoveryNotes: notesArray.join(' ')}));
                        } else {
                          const index = notesArray.indexOf('feel_great');
                          if (index > -1) {
                            notesArray.splice(index, 1);
                          }
                          setFormData({...formData, recoveryNotes: notesArray.join(' ')});
                        }
                      }}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm">✨ I feel great and ready to play!</span>
                  </label>
                </div>
                
                {/* Calculate recovery level based on symptoms */}
                {(() => {
                  const notes = formData.recoveryNotes || '';
                  let recoveryMessage = '';
                  let recoveryColor = '';
                  let recoveryEmoji = '';
                  
                  // Auto-calculate recovery level based on symptoms
                  let calculatedLevel = 3; // Default
                  
                  if (notes.includes('feel_great')) {
                    calculatedLevel = 5;
                    recoveryMessage = 'Excellent recovery! You\'re ready to go!';
                    recoveryColor = 'text-green-600 bg-green-50';
                    recoveryEmoji = '🚀';
                  } else if (notes.includes('legs_heavy') && notes.includes('muscles_sore')) {
                    calculatedLevel = 2;
                    recoveryMessage = 'Your body needs more recovery time';
                    recoveryColor = 'text-orange-600 bg-orange-50';
                    recoveryEmoji = '⚠️';
                  } else if (notes.includes('hard_to_run')) {
                    calculatedLevel = 2;
                    recoveryMessage = 'Take it easy today, focus on light activity';
                    recoveryColor = 'text-yellow-600 bg-yellow-50';
                    recoveryEmoji = '🔋';
                  } else if (notes.includes('legs_heavy') || notes.includes('muscles_sore')) {
                    calculatedLevel = 3;
                    recoveryMessage = 'Some recovery needed, but you can train lightly';
                    recoveryColor = 'text-blue-600 bg-blue-50';
                    recoveryEmoji = '💪';
                  } else {
                    recoveryMessage = 'Check the boxes that describe how you feel';
                    recoveryColor = 'text-gray-600 bg-gray-50';
                    recoveryEmoji = '📝';
                  }
                  
                  // Update recovery level silently
                  if (formData.recoveryLevel !== calculatedLevel && notes.length > 0) {
                    setTimeout(() => {
                      setFormData(prev => ({...prev, recoveryLevel: calculatedLevel}));
                    }, 0);
                  }
                  
                  return (
                    <div className={`rounded-lg p-3 ${recoveryColor} border`}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{recoveryEmoji}</span>
                        <span className="text-sm font-medium">{recoveryMessage}</span>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">
                    Recovery Nutrition
                  </p>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hadRecoveryMeal}
                        onChange={(e) => setFormData({...formData, hadRecoveryMeal: e.target.checked})}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Had recovery meal/snack within 30 minutes
                      </span>
                    </label>
                    
                    {formData.hadRecoveryMeal && (
                      <div className="mt-3 ml-8 space-y-2">
                        <p className="text-xs text-gray-600 font-medium">Recovery meal included:</p>
                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full cursor-pointer">
                            <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                            <span>🥛 Protein</span>
                          </label>
                          <label className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full cursor-pointer">
                            <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                            <span>🍌 Carbs</span>
                          </label>
                          <label className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full cursor-pointer">
                            <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                            <span>💧 Fluids</span>
                          </label>
                          <label className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full cursor-pointer">
                            <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                            <span>🥗 Vegetables</span>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 p-2 bg-white/60 rounded text-xs text-gray-600">
                      💡 <strong>Tip:</strong> Protein + carbs within 30 min = faster recovery!
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                  
                  // Determine border color based on energy level (1-10 scale)
                  const borderColor = entry.energyLevel >= 7 ? 'border-green-500' : 
                                     entry.energyLevel >= 4 ? 'border-yellow-500' : 
                                     'border-red-500';
                  const bgGradient = entry.energyLevel >= 7 ? 'from-green-50' : 
                                    entry.energyLevel >= 4 ? 'from-yellow-50' : 
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
                              <span className="font-medium">{entry.energyLevel}/10</span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              <span>😴</span>
                              <span className="font-medium">{entry.sleepHours}h</span>
                              {entry.bedTime && entry.wakeTime && (
                                <span className="text-xs text-gray-500">({entry.bedTime}-{entry.wakeTime})</span>
                              )}
                            </span>
                            {entry.recoveryNotes && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="flex items-center gap-1">
                                  {entry.recoveryNotes.includes('feel_great') ? (
                                    <><span>✨</span><span className="text-xs text-green-600">Great!</span></>
                                  ) : entry.recoveryNotes.includes('muscles_sore') ? (
                                    <><span>💪</span><span className="text-xs text-yellow-600">Sore</span></>
                                  ) : entry.recoveryNotes.includes('legs_heavy') ? (
                                    <><span>🦵</span><span className="text-xs text-orange-600">Tired</span></>
                                  ) : null}
                                </span>
                              </>
                            )}
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
                          {entry.hadRecoveryMeal && (
                            <div className="mt-2">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                ✅ Recovery Meal
                              </span>
                            </div>
                          )}
                          {entry.recoveryNotes && !entry.recoveryNotes.includes('legs_heavy') && !entry.recoveryNotes.includes('muscles_sore') && !entry.recoveryNotes.includes('hard_to_run') && !entry.recoveryNotes.includes('feel_great') && (
                            <p className="text-xs text-gray-600 mt-2 italic">Recovery: {entry.recoveryNotes}</p>
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