import { useState } from 'react'

export default function Team() {
  const [teamCode, setTeamCode] = useState('')
  const [hasTeam, setHasTeam] = useState(false)

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE}/api/v1/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
        },
        body: JSON.stringify({ code: teamCode })
      })
      
      if (response.ok) {
        setHasTeam(true)
        alert('Successfully joined team!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to join team. Please check the code and try again.')
      }
    } catch (error) {
      console.error('Error joining team:', error)
      alert('Network error. Please try again.')
    }
  }

  if (!hasTeam) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Team Management</h1>
          <p className="text-gray-600 mt-2">Join your team to share progress with coaches</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <span className="text-5xl">👥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">You're not in a team yet</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Ask your coach for the team code to join and start sharing your nutrition data
            </p>
          </div>

          <form onSubmit={handleJoinTeam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Code
              </label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl font-mono border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Join Team
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                Are you a coach?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a team to monitor your players' nutrition and performance
              </p>
              <button className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1">
                <span>Create a new team</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">FC Junior Squad</h1>
            <p className="text-gray-600 mt-2">Team code: <span className="font-mono font-bold text-purple-600">FCJ123</span></p>
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all font-medium">
            Leave Team
          </button>
        </div>
      </div>

      {/* Team Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Team Size</p>
              <p className="text-3xl font-bold text-gray-800">12</p>
              <p className="text-sm text-gray-600 mt-1">Active Members</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Meal Tracking</p>
              <p className="text-3xl font-bold text-gray-800">85%</p>
              <p className="text-sm text-gray-600 mt-1">Avg Completion</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">🍽️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Team Energy</p>
              <p className="text-3xl font-bold text-gray-800">4.1<span className="text-xl text-gray-500">/5</span></p>
              <p className="text-sm text-gray-600 mt-1">Average Level</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Team Members</h2>
            <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
              12 Players
            </span>
          </div>
        </div>
        <div className="divide-y">
          <div className="px-6 py-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">JD</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">John Doe</div>
                  <div className="text-sm text-gray-500">Forward • #10</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Active now</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-2 h-4 rounded-full ${i <= 5 ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Sarah Miller</div>
                  <div className="text-sm text-gray-500">Midfielder • #8</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Active today</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-2 h-4 rounded-full ${i <= 4 ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">TJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Tom Johnson</div>
                  <div className="text-sm text-gray-500">Goalkeeper • #1</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-500">2 days ago</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-2 h-4 rounded-full ${i <= 3 ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}