import React, { useState, useEffect } from 'react';
import { Trophy, Target, Users, Timer, Award, Plus, TrendingUp, Flag, ChevronRight } from 'lucide-react';
import { useUserProfile } from '../../contexts/UserContext';
import { format, differenceInDays, addDays } from 'date-fns';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'nutrition' | 'streak' | 'performance' | 'team';
  status: 'active' | 'completed' | 'upcoming';
  startDate: Date;
  endDate: Date;
  target: {
    meals?: number;
    days?: number;
    score?: number;
    participants?: number;
  };
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  reward: {
    xp: number;
    badge?: string;
    title?: string;
  };
  participants: {
    id: string;
    name: string;
    progress: number;
  }[];
  createdBy: string;
  creatorName: string;
}

interface TeamChallengesProps {
  teamId: string;
  userId: string;
  isCoach?: boolean;
}

export default function TeamChallenges({ teamId, userId, isCoach = false }: TeamChallengesProps) {
  const { profile } = useUserProfile();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'upcoming'>('active');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'nutrition' as Challenge['type'],
    duration: 7, // days
    targetValue: 0,
    targetType: 'meals' as 'meals' | 'days' | 'score' | 'participants',
    xpReward: 100
  });

  // Mock challenges
  const mockChallenges: Challenge[] = [
    {
      id: '1',
      name: '🥗 7-Day Nutrition Champion',
      description: 'Log all meals for 7 consecutive days with a nutrition score above 70',
      type: 'nutrition',
      status: 'active',
      startDate: new Date(Date.now() - 3 * 86400000),
      endDate: new Date(Date.now() + 4 * 86400000),
      target: { days: 7, score: 70 },
      progress: { current: 3, total: 7, percentage: 43 },
      reward: { xp: 150, badge: '🏆' },
      participants: [
        { id: '1', name: 'Emma V.', progress: 5 },
        { id: '2', name: 'John D.', progress: 3 },
        { id: '3', name: 'Sarah M.', progress: 4 }
      ],
      createdBy: 'coach1',
      creatorName: 'Coach Johnson'
    },
    {
      id: '2',
      name: '💪 Team Streak Challenge',
      description: 'Entire team maintains a 5-day logging streak',
      type: 'team',
      status: 'active',
      startDate: new Date(Date.now() - 2 * 86400000),
      endDate: new Date(Date.now() + 3 * 86400000),
      target: { days: 5, participants: 15 },
      progress: { current: 12, total: 15, percentage: 80 },
      reward: { xp: 200, title: 'Team Player' },
      participants: [
        { id: '1', name: 'Emma V.', progress: 100 },
        { id: '2', name: 'John D.', progress: 100 },
        { id: '3', name: 'Sarah M.', progress: 80 }
      ],
      createdBy: 'coach1',
      creatorName: 'Coach Johnson'
    },
    {
      id: '3',
      name: '⚡ Energy Boost Week',
      description: 'Maintain energy levels above 4/5 for a full week',
      type: 'performance',
      status: 'upcoming',
      startDate: new Date(Date.now() + 2 * 86400000),
      endDate: new Date(Date.now() + 9 * 86400000),
      target: { days: 7, score: 4 },
      progress: { current: 0, total: 7, percentage: 0 },
      reward: { xp: 100, badge: '⚡' },
      participants: [],
      createdBy: 'coach2',
      creatorName: 'Coach Smith'
    },
    {
      id: '4',
      name: '🏅 Perfect Meal Week',
      description: 'Log 21 meals with excellent nutrition scores',
      type: 'nutrition',
      status: 'completed',
      startDate: new Date(Date.now() - 10 * 86400000),
      endDate: new Date(Date.now() - 3 * 86400000),
      target: { meals: 21 },
      progress: { current: 21, total: 21, percentage: 100 },
      reward: { xp: 250, badge: '🥇' },
      participants: [
        { id: '1', name: 'Emma V.', progress: 100 },
        { id: '2', name: 'John D.', progress: 95 }
      ],
      createdBy: 'coach1',
      creatorName: 'Coach Johnson'
    }
  ];

  useEffect(() => {
    loadChallenges();
  }, [teamId]);

  const loadChallenges = async () => {
    try {
      // In production, fetch from API
      // const response = await API.teams.getChallenges(teamId);
      // setChallenges(response.data);
      
      // For now, use mock data
      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      // In production, call API
      // await API.teams.joinChallenge(challengeId);
      
      setChallenges(prev => prev.map(c => {
        if (c.id === challengeId) {
          const newParticipant = {
            id: userId,
            name: profile?.name || 'User',
            progress: 0
          };
          return {
            ...c,
            participants: [...c.participants, newParticipant]
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const createChallenge = async () => {
    if (!formData.name || !formData.description) return;

    const newChallenge: Challenge = {
      id: `new-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      status: 'active',
      startDate: new Date(),
      endDate: addDays(new Date(), formData.duration),
      target: { [formData.targetType]: formData.targetValue },
      progress: { current: 0, total: formData.targetValue, percentage: 0 },
      reward: { xp: formData.xpReward },
      participants: [],
      createdBy: userId,
      creatorName: profile?.name || 'Coach'
    };

    try {
      // In production, call API
      // await API.teams.createChallenge(teamId, newChallenge);
      
      setChallenges(prev => [newChallenge, ...prev]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'nutrition',
      duration: 7,
      targetValue: 0,
      targetType: 'meals',
      xpReward: 100
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nutrition':
        return <Target className="w-5 h-5 text-green-500" />;
      case 'streak':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'performance':
        return <Timer className="w-5 h-5 text-purple-500" />;
      case 'team':
        return <Users className="w-5 h-5 text-orange-500" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nutrition':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'streak':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'performance':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'team':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredChallenges = challenges.filter(c => c.status === activeTab);
  const isParticipating = (challenge: Challenge) => 
    challenge.participants.some(p => p.id === userId);

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            <h2 className="text-xl font-bold">Team Challenges</h2>
          </div>
          {isCoach && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {(['active', 'completed', 'upcoming'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab} ({challenges.filter(c => c.status === tab).length})
          </button>
        ))}
      </div>

      {/* Create Form */}
      {showCreateForm && isCoach && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Challenge name..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Challenge description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Challenge['type'] })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="nutrition">Nutrition</option>
                <option value="streak">Streak</option>
                <option value="performance">Performance</option>
                <option value="team">Team</option>
              </select>
              <input
                type="number"
                min="1"
                placeholder="Duration (days)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 7 })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="meals">Meals Target</option>
                <option value="days">Days Target</option>
                <option value="score">Score Target</option>
                <option value="participants">Participants Target</option>
              </select>
              <input
                type="number"
                min="1"
                placeholder="Target value"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="50"
                step="50"
                placeholder="XP Reward"
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 100 })}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-500">XP reward for completion</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={createChallenge}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Challenge
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenges List */}
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No {activeTab} challenges</p>
          </div>
        ) : (
          filteredChallenges.map((challenge) => {
            const daysRemaining = differenceInDays(challenge.endDate, new Date());
            const participating = isParticipating(challenge);
            
            return (
              <div
                key={challenge.id}
                className={`border-2 rounded-lg p-4 transition-all ${getTypeColor(challenge.type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(challenge.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{challenge.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(challenge.status)}`}>
                    {challenge.status}
                  </span>
                </div>

                {/* Progress Bar */}
                {challenge.status === 'active' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${challenge.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Challenge Details */}
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">
                      {format(challenge.startDate, 'MMM d')} - {format(challenge.endDate, 'MMM d')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Reward:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      {challenge.reward.xp} XP
                      {challenge.reward.badge && ` ${challenge.reward.badge}`}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{challenge.participants.length} participants</span>
                    {challenge.status === 'active' && daysRemaining > 0 && (
                      <span className="text-orange-600">
                        <Timer className="w-4 h-4 inline mr-1" />
                        {daysRemaining} days left
                      </span>
                    )}
                  </div>
                  
                  {/* Top Participants */}
                  {challenge.participants.length > 0 && (
                    <div className="space-y-1">
                      {challenge.participants.slice(0, 3).map((participant, idx) => (
                        <div key={participant.id} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {idx === 0 && '🥇'}
                            {idx === 1 && '🥈'}
                            {idx === 2 && '🥉'}
                            <span className={participant.id === userId ? 'font-semibold' : ''}>
                              {participant.name}
                            </span>
                          </span>
                          <span className="text-gray-500">{participant.progress}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    Created by {challenge.creatorName}
                  </span>
                  {challenge.status === 'active' && !participating && (
                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      Join Challenge
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {participating && (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <Flag className="w-4 h-4" />
                      Participating
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}