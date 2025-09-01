import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useUserProfile } from '../contexts/UserContext';
import Layout from '../components/Layout';
import TeamChat from '../components/team/TeamChat';
import CoachAnnouncements from '../components/team/CoachAnnouncements';
import TeamChallenges from '../components/team/TeamChallenges';
import { Users, Trophy, MessageCircle, Bell, Target, ArrowLeft, Settings, UserPlus, Shield } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: 'PLAYER' | 'COACH' | 'ADMIN';
  position?: string;
  totalXP: number;
  currentStreak: number;
  nutritionScore: number;
  lastActive: Date;
  avatar?: string;
}

interface TeamStats {
  totalMembers: number;
  activeToday: number;
  averageNutritionScore: number;
  totalXP: number;
  currentChallenges: number;
  completedChallenges: number;
  teamStreak: number;
}

export default function TeamDashboard() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'announcements' | 'challenges'>('overview');
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isCoach = profile?.role === 'COACH' || profile?.role === 'ADMIN';

  // Mock data
  const mockMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Emma V.',
      role: 'PLAYER',
      position: 'Forward',
      totalXP: 2450,
      currentStreak: 7,
      nutritionScore: 85,
      lastActive: new Date()
    },
    {
      id: '2',
      name: 'John D.',
      role: 'PLAYER',
      position: 'Midfielder',
      totalXP: 2100,
      currentStreak: 5,
      nutritionScore: 78,
      lastActive: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      name: 'Coach Johnson',
      role: 'COACH',
      totalXP: 5000,
      currentStreak: 15,
      nutritionScore: 92,
      lastActive: new Date()
    },
    {
      id: '4',
      name: 'Sarah M.',
      role: 'PLAYER',
      position: 'Defender',
      totalXP: 1850,
      currentStreak: 3,
      nutritionScore: 72,
      lastActive: new Date(Date.now() - 7200000)
    }
  ];

  const mockStats: TeamStats = {
    totalMembers: 15,
    activeToday: 12,
    averageNutritionScore: 79,
    totalXP: 28500,
    currentChallenges: 3,
    completedChallenges: 8,
    teamStreak: 4
  };

  useEffect(() => {
    if (!teamId) {
      navigate('/teams');
      return;
    }
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // const response = await API.teams.getTeam(teamId);
      // setTeamName(response.data.name);
      // setTeamCode(response.data.inviteCode);
      // setMembers(response.data.members);
      // setTeamStats(response.data.stats);
      
      // For now, use mock data
      setTeamName('Helsinki Hawks U16');
      setTeamCode('HAWKS2024');
      setMembers(mockMembers);
      setTeamStats(mockStats);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(teamCode);
    // Show notification
    alert('Team code copied to clipboard!');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'COACH':
        return 'bg-blue-100 text-blue-800';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/teams')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Teams
          </button>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{teamName}</h1>
                <div className="flex items-center gap-6 text-blue-100">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {teamStats?.totalMembers} members
                  </span>
                  <span className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {teamStats?.totalXP.toLocaleString()} XP
                  </span>
                  <span className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {teamStats?.currentChallenges} active challenges
                  </span>
                </div>
              </div>
              {isCoach && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    Invite
                  </button>
                  <button
                    onClick={() => navigate(`/teams/${teamId}/settings`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'chat', label: 'Team Chat', icon: MessageCircle },
              { id: 'announcements', label: 'Announcements', icon: Bell },
              { id: 'challenges', label: 'Challenges', icon: Trophy }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Stats */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Team Statistics
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <p className="text-sm text-blue-600 mb-1">Active Today</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {teamStats?.activeToday}/{teamStats?.totalMembers}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                      <p className="text-sm text-green-600 mb-1">Avg Nutrition</p>
                      <p className="text-2xl font-bold text-green-900">{teamStats?.averageNutritionScore}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <p className="text-sm text-purple-600 mb-1">Team Streak</p>
                      <p className="text-2xl font-bold text-purple-900">{teamStats?.teamStreak} days</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                      <p className="text-sm text-orange-600 mb-1">Challenges Won</p>
                      <p className="text-2xl font-bold text-orange-900">{teamStats?.completedChallenges}</p>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-500" />
                    Team Members
                  </h2>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{member.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(member.role)}`}>
                                {member.role}
                              </span>
                            </div>
                            {member.position && (
                              <p className="text-sm text-gray-500">{member.position}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.totalXP.toLocaleString()} XP</p>
                          <p className="text-xs text-gray-500">
                            {member.currentStreak} day streak
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Team Code</h3>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-2xl font-mono font-bold text-blue-600 mb-2">{teamCode}</p>
                    <button
                      onClick={copyInviteCode}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Click to copy
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-2 text-orange-900">Today's Goal</h3>
                  <p className="text-sm text-orange-700 mb-4">
                    Log all your meals and maintain your nutrition streak!
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-600">Team Progress</span>
                    <span className="font-bold text-orange-900">80%</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <TeamChat teamId={teamId!} teamName={teamName} />
          )}

          {activeTab === 'announcements' && (
            <CoachAnnouncements 
              teamId={teamId!} 
              userId={user?.id || ''} 
              isCoach={isCoach} 
            />
          )}

          {activeTab === 'challenges' && (
            <TeamChallenges 
              teamId={teamId!} 
              userId={user?.id || ''} 
              isCoach={isCoach} 
            />
          )}
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Invite Team Members</h3>
              <p className="text-gray-600 mb-4">
                Share this code with players to join the team:
              </p>
              <div className="bg-gray-100 rounded-lg p-4 text-center mb-4">
                <p className="text-3xl font-mono font-bold text-blue-600">{teamCode}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyInviteCode}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy Code
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}