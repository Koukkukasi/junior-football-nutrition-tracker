import { useState, useEffect } from 'react';
import { useUserProfile } from '../contexts/UserContext';

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

interface TeamDetails extends Team {
  members: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      age?: number;
      position?: string;
      ageGroup?: string;
    };
    role: string;
    joinedAt: string;
  }>;
  userRole: string;
}

// Mock data for teams feature (until backend/Supabase implementation is ready)
const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'FC Inter P13 2012',
    description: 'U13 competitive team focusing on nutrition and performance',
    inviteCode: 'INTER2012',
    memberRole: 'member',
    joinedAt: new Date().toISOString(),
    _count: { members: 0 }
  }
];

const MOCK_TEAM_DETAILS: TeamDetails = {
  ...MOCK_TEAMS[0],
  userRole: 'member',
  members: []
};

export default function Team() {
  const { profile } = useUserProfile();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Simulate loading teams (using mock data for now)
    setTimeout(() => {
      setTeams(MOCK_TEAMS);
      setSelectedTeam(MOCK_TEAM_DETAILS);
      setLoading(false);
    }, 500);
  }, []);

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setError('');
    // Simulate joining a team
    setLoading(true);
    setTimeout(() => {
      if (inviteCode === 'INTER2012') {
        setSuccess('Successfully joined FC Inter P13 2012!');
        setTeams(MOCK_TEAMS);
        setSelectedTeam(MOCK_TEAM_DETAILS);
      } else {
        setError('Invalid invite code');
      }
      setInviteCode('');
      setJoiningTeam(false);
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }, 500);
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    // Simulate leaving team (mock implementation)
    setLoading(true);
    setTimeout(() => {
      setSuccess('Successfully left the team');
      setTeams([]);
      setSelectedTeam(null);
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isCoachOrAdmin = profile?.role === 'COACH' || profile?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
              <p className="text-gray-600 mt-1">View your teams and connect with teammates</p>
            </div>
            <div className="flex gap-3">
              {isCoachOrAdmin && (
                <a
                  href="/coach-dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Coach Dashboard
                </a>
              )}
              <button
                onClick={() => setJoiningTeam(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Join Team
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Teams</h2>
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-3">No teams yet</p>
                  <button
                    onClick={() => setJoiningTeam(true)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Join your first team
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeam({...team, members: [], userRole: team.memberRole})}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTeam?.id === team.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {team._count.members} members
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          team.memberRole === 'COACH' ? 'bg-purple-100 text-purple-700' :
                          team.memberRole === 'ASSISTANT' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {team.memberRole}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h2>
                    {selectedTeam.description && (
                      <p className="text-gray-600 mt-1">{selectedTeam.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                        Invite Code: <span className="font-mono font-bold">{selectedTeam.inviteCode}</span>
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        selectedTeam.userRole === 'COACH' ? 'bg-purple-100 text-purple-700' :
                        selectedTeam.userRole === 'ASSISTANT' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        Your Role: {selectedTeam.userRole}
                      </span>
                    </div>
                  </div>
                  {selectedTeam.userRole !== 'COACH' && (
                    <button
                      onClick={() => handleLeaveTeam()}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                    >
                      Leave Team
                    </button>
                  )}
                </div>

                {/* Team Members */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members ({selectedTeam.members.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTeam.members.map((member) => (
                      <div key={member.user.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{member.user.name}</p>
                            <p className="text-sm text-gray-600">{member.user.email}</p>
                            {member.user.position && (
                              <p className="text-xs text-gray-500 mt-1">
                                {member.user.position} • Age Group: {member.user.ageGroup}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            member.role === 'COACH' ? 'bg-purple-100 text-purple-700' :
                            member.role === 'ASSISTANT' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Team</h3>
                <p className="text-gray-600">Choose a team from the list to view details and members</p>
              </div>
            )}
          </div>
        </div>

        {/* Join Team Modal */}
        {joiningTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Join a Team</h3>
              <p className="text-gray-600 mb-4">Enter the invite code provided by your coach</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Invite Code
                  </label>
                  <input
                    id="inviteCode"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-center text-lg"
                    placeholder="XXXXXXXX"
                    maxLength={8}
                  />
                </div>
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setJoiningTeam(false);
                    setInviteCode('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinTeam}
                  disabled={!inviteCode.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}