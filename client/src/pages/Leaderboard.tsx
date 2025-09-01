import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, User, TrendingUp, Flame, Target } from 'lucide-react';
import { useUserProfile } from '../contexts/UserContext';
import { supabaseAPI } from '../lib/supabase-api';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  team?: string;
  totalXP: number;
  nutritionScore: number;
  streak: number;
  mealsLogged: number;
  weeklyXP?: number;
  monthlyXP?: number;
  avatar?: string;
  position?: string;
  isCurrentUser?: boolean;
}

interface TeamLeaderboardEntry {
  id: string;
  rank: number;
  teamName: string;
  memberCount: number;
  avgNutritionScore: number;
  totalXP: number;
  topPerformer: string;
  weeklyProgress: number;
}

type TimeRange = 'week' | 'month' | 'all-time';
type LeaderboardType = 'individual' | 'team';

export default function Leaderboard() {
  const { profile } = useUserProfile();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('individual');
  const [individualLeaderboard, setIndividualLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<TeamLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Mock data for demonstration
  const mockIndividualData: LeaderboardEntry[] = [
    {
      id: '1',
      rank: 1,
      name: 'Emma Virtanen',
      team: 'FC Inter P13',
      totalXP: 2850,
      nutritionScore: 92,
      streak: 15,
      mealsLogged: 75,
      weeklyXP: 450,
      position: 'Forward'
    },
    {
      id: '2',
      rank: 2,
      name: 'Mikko Järvinen',
      team: 'FC Inter P13',
      totalXP: 2720,
      nutritionScore: 88,
      streak: 12,
      mealsLogged: 71,
      weeklyXP: 420,
      position: 'Midfielder'
    },
    {
      id: '3',
      rank: 3,
      name: 'Sofia Hakkarainen',
      team: 'HJK Juniors',
      totalXP: 2650,
      nutritionScore: 90,
      streak: 8,
      mealsLogged: 68,
      weeklyXP: 380,
      position: 'Defender'
    },
    {
      id: '4',
      rank: 4,
      name: 'Aleksi Nieminen',
      team: 'FC Inter P13',
      totalXP: 2480,
      nutritionScore: 85,
      streak: 10,
      mealsLogged: 65,
      weeklyXP: 350,
      position: 'Goalkeeper'
    },
    {
      id: '5',
      rank: 5,
      name: 'Aino Korhonen',
      team: 'KuPS Academy',
      totalXP: 2350,
      nutritionScore: 83,
      streak: 7,
      mealsLogged: 62,
      weeklyXP: 320,
      position: 'Midfielder'
    },
    {
      id: 'current',
      rank: 8,
      name: profile?.name || 'You',
      team: 'FC Inter P13',
      totalXP: 1850,
      nutritionScore: 78,
      streak: 5,
      mealsLogged: 45,
      weeklyXP: 280,
      position: profile?.position || 'Player',
      isCurrentUser: true
    }
  ];

  const mockTeamData: TeamLeaderboardEntry[] = [
    {
      id: '1',
      rank: 1,
      teamName: 'FC Inter P13',
      memberCount: 18,
      avgNutritionScore: 86,
      totalXP: 42500,
      topPerformer: 'Emma Virtanen',
      weeklyProgress: 12
    },
    {
      id: '2',
      rank: 2,
      teamName: 'HJK Juniors',
      memberCount: 22,
      avgNutritionScore: 84,
      totalXP: 41200,
      topPerformer: 'Sofia Hakkarainen',
      weeklyProgress: 8
    },
    {
      id: '3',
      rank: 3,
      teamName: 'KuPS Academy',
      memberCount: 20,
      avgNutritionScore: 82,
      totalXP: 39800,
      topPerformer: 'Aino Korhonen',
      weeklyProgress: 15
    },
    {
      id: '4',
      rank: 4,
      teamName: 'TPS Youth',
      memberCount: 16,
      avgNutritionScore: 80,
      totalXP: 37500,
      topPerformer: 'Joonas Mäkinen',
      weeklyProgress: -2
    }
  ];

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeRange, leaderboardType]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from the actual API
      // For now, using mock data with slight variations based on time range
      setTimeout(() => {
        if (leaderboardType === 'individual') {
          let data = [...mockIndividualData];
          
          // Adjust data based on time range
          if (timeRange === 'week') {
            data = data.map(entry => ({
              ...entry,
              totalXP: entry.weeklyXP || entry.totalXP / 6
            }));
          } else if (timeRange === 'month') {
            data = data.map(entry => ({
              ...entry,
              totalXP: (entry.weeklyXP || 0) * 4
            }));
          }
          
          // Sort by XP
          data.sort((a, b) => b.totalXP - a.totalXP);
          
          // Update ranks
          data = data.map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));
          
          setIndividualLeaderboard(data);
          
          // Find current user's rank
          const userEntry = data.find(entry => entry.isCurrentUser);
          if (userEntry) {
            setUserRank(userEntry.rank);
          }
        } else {
          setTeamLeaderboard(mockTeamData);
        }
        
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-white/80">
          Compete with other players and teams to reach the top!
        </p>
        {userRank && leaderboardType === 'individual' && (
          <div className="mt-4 bg-white/20 rounded-lg p-3 inline-block">
            <p className="text-sm">Your Current Rank</p>
            <p className="text-2xl font-bold">#{userRank}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setLeaderboardType('individual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                leaderboardType === 'individual'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              Individual
            </button>
            <button
              onClick={() => setLeaderboardType('team')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                leaderboardType === 'team'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Teams
            </button>
          </div>

          {/* Time Range */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'week'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'month'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('all-time')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'all-time'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        ) : leaderboardType === 'individual' ? (
          <>
            {individualLeaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-xl border-2 p-4 transition-all ${
                  entry.isCurrentUser 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : getRankBgColor(entry.rank)
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 text-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Player Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">
                          {entry.name}
                          {entry.isCurrentUser && (
                            <span className="ml-2 text-sm text-indigo-600">(You)</span>
                          )}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {entry.team} • {entry.position}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{entry.totalXP}</p>
                      <p className="text-xs text-gray-500">XP</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-green-600">{entry.nutritionScore}%</p>
                      <p className="text-xs text-gray-500">Nutrition</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-lg font-semibold">{entry.streak}</p>
                        <p className="text-xs text-gray-500">Streak</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{entry.mealsLogged}</p>
                      <p className="text-xs text-gray-500">Meals</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {teamLeaderboard.map((team) => (
              <div
                key={team.id}
                className={`rounded-xl border-2 p-4 transition-all ${getRankBgColor(team.rank)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 text-center">
                      {getRankIcon(team.rank)}
                    </div>

                    {/* Team Info */}
                    <div>
                      <h3 className="font-bold text-lg">{team.teamName}</h3>
                      <p className="text-sm text-gray-600">
                        {team.memberCount} players • Top: {team.topPerformer}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">
                        {team.totalXP.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Total XP</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-green-600">
                        {team.avgNutritionScore}%
                      </p>
                      <p className="text-xs text-gray-500">Avg Nutrition</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp 
                        className={`w-5 h-5 ${
                          team.weeklyProgress > 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      />
                      <div>
                        <p className={`text-lg font-semibold ${
                          team.weeklyProgress > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {team.weeklyProgress > 0 ? '+' : ''}{team.weeklyProgress}%
                        </p>
                        <p className="text-xs text-gray-500">This Week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Motivational Footer */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-bold text-green-900">Keep pushing!</h3>
            <p className="text-green-700">
              {leaderboardType === 'individual' 
                ? 'Log your meals consistently and maintain high nutrition scores to climb the ranks!'
                : 'Work together with your team to achieve better nutrition and reach the top!'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}