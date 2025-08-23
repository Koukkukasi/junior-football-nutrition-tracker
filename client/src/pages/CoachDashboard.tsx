import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/UserContext';
import API from '../lib/api';

interface Team {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  memberRole: string;
  joinedAt: string;
  _count: {
    members: number;
  };
}

interface TeamStats {
  totalMembers: number;
  averageMealsPerDay: number;
  averageEnergyLevel: number;
  averageSleepHours: number;
  memberStats: Array<{
    userId: string;
    name: string;
    role: string;
    mealsLogged: number;
    avgEnergyLevel: number;
    avgSleepHours: number;
  }>;
}

export default function CoachDashboard() {
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [statsPeriod, setStatsPeriod] = useState<'7d' | '30d'>('7d');

  // Check if user is coach or admin
  const isAuthorized = profile?.role === 'COACH' || profile?.role === 'ADMIN';

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/dashboard');
      return;
    }
    fetchTeams();
  }, [isAuthorized, navigate]);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamStats(selectedTeam);
    }
  }, [selectedTeam, statsPeriod]);

  const fetchTeams = async () => {
    try {
      const response = await API.teams.getMyTeams();
      if (response.success) {
        const coachTeams = response.data.filter((team: Team) => 
          team.memberRole === 'COACH' || team.memberRole === 'ASSISTANT'
        );
        setTeams(coachTeams);
        if (coachTeams.length > 0 && !selectedTeam) {
          setSelectedTeam(coachTeams[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStats = async (teamId: string) => {
    try {
      const response = await API.teams.getStats(teamId, statsPeriod);
      if (response.success) {
        setTeamStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch team stats:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const response = await API.teams.create({
        name: newTeamName,
        description: newTeamDescription || undefined
      });
      if (response.success) {
        await fetchTeams();
        setCreatingTeam(false);
        setNewTeamName('');
        setNewTeamDescription('');
        setSelectedTeam(response.data.id);
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your teams and track player performance</p>
            </div>
            <button
              onClick={() => setCreatingTeam(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Create Team
            </button>
          </div>
        </div>

        {/* Team Selection */}
        {teams.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Select Team</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatsPeriod('7d')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statsPeriod === '7d' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setStatsPeriod('30d')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statsPeriod === '30d' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTeam === team.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{team._count.members} members</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Code: {team.inviteCode}
                    </span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {team.memberRole}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Statistics */}
        {selectedTeam && teamStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overview Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-blue-600">{teamStats.totalMembers}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Meals/Day</p>
                  <p className="text-2xl font-bold text-green-600">
                    {teamStats.averageMealsPerDay.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Energy</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {teamStats.averageEnergyLevel.toFixed(1)}/10
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Sleep</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {teamStats.averageSleepHours.toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>

            {/* Member Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Member Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Player</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Meals</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Energy</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Sleep</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStats.memberStats.map((member) => (
                      <tr key={member.userId} className="border-b hover:bg-gray-50">
                        <td className="py-2">
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            member.mealsLogged >= 20 ? 'bg-green-100 text-green-700' :
                            member.mealsLogged >= 10 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {member.mealsLogged}
                          </span>
                        </td>
                        <td className="text-center py-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            member.avgEnergyLevel >= 7 ? 'bg-green-100 text-green-700' :
                            member.avgEnergyLevel >= 5 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {member.avgEnergyLevel.toFixed(1)}
                          </span>
                        </td>
                        <td className="text-center py-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            member.avgSleepHours >= 8 ? 'bg-green-100 text-green-700' :
                            member.avgSleepHours >= 6 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {member.avgSleepHours.toFixed(1)}h
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* No Teams Message */}
        {teams.length === 0 && !creatingTeam && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teams Yet</h3>
              <p className="text-gray-600 mb-6">Create your first team to start tracking player performance and nutrition.</p>
              <button
                onClick={() => setCreatingTeam(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Create Your First Team
              </button>
            </div>
          </div>
        )}

        {/* Create Team Modal */}
        {creatingTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Team</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., U16 Eagles"
                  />
                </div>
                <div>
                  <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="teamDescription"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Team description..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setCreatingTeam(false);
                    setNewTeamName('');
                    setNewTeamDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}