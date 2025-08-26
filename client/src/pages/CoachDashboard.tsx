import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/UserContext';
import { supabaseAPI } from '../lib/supabase-api';
import { analyzeFoodQuality } from '../lib/food-database';
import { calculateNutritionScore } from '../utils/foodUtils';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  UtensilsCrossed,
  Activity,
  ChevronRight,
  Search,
  Filter,
  Moon,
  Zap,
  Trophy,
  Target,
  Clock
} from 'lucide-react';

interface PlayerData {
  id: string;
  name: string;
  email: string;
  age: number;
  ageGroup: string;
  position?: string;
  lastActive: Date;
  todayMeals: number;
  weekAvgScore: number;
  currentStreak: number;
  totalMealsLogged: number;
  complianceRate: number; // Percentage of expected meals logged
  lastWeekPerformance?: {
    energyLevel: number;
    sleepHours: number;
    trainingDays: number;
  };
}

interface PlayerDetailModalProps {
  player: PlayerData | null;
  onClose: () => void;
}

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose }) => {
  const [playerMeals, setPlayerMeals] = useState<any[]>([]);
  const [playerPerformance, setPlayerPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (player) {
      fetchPlayerDetails();
    }
  }, [player]);

  const fetchPlayerDetails = async () => {
    if (!player) return;
    
    setLoading(true);
    try {
      // For now, using mock data since we don't have real player filtering yet
      // In production, this would filter by player.id
      const foodResponse = await supabaseAPI.food.getEntries();
      const perfResponse = await supabaseAPI.performance.getEntries();
      
      // Mock filtering - in real app, would filter by player ID
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (foodResponse.success && foodResponse.data) {
        const recentMeals = (foodResponse.data || [])
          .filter((entry: any) => new Date(entry.created_at) >= weekAgo)
          .slice(0, 10);
        setPlayerMeals(recentMeals);
      }
      
      if (perfResponse.success && perfResponse.data) {
        const recentPerf = (perfResponse.data || []).slice(0, 7);
        setPlayerPerformance(recentPerf);
      }
    } catch (error) {
      console.error('Failed to fetch player details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!player) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{player.name}</h2>
            <p className="text-gray-600">{player.position || 'Player'} • Age {player.age} ({player.ageGroup})</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Player Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Today's Meals</div>
                  <div className="text-2xl font-bold text-blue-600">{player.todayMeals}/5</div>
                </div>
                <UtensilsCrossed className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Week Avg Score</div>
                  <div className="text-2xl font-bold text-green-600">{player.weekAvgScore}%</div>
                </div>
                <Trophy className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Compliance</div>
                  <div className="text-2xl font-bold text-orange-600">{player.complianceRate}%</div>
                </div>
                <Target className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Streak</div>
                  <div className="text-2xl font-bold text-purple-600">{player.currentStreak} days</div>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Recent Meals */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Recent Meals</h3>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : playerMeals.length > 0 ? (
              <div className="space-y-2">
                {playerMeals.slice(0, 5).map((meal: any, index) => {
                  const quality = analyzeFoodQuality(meal.description).quality;
                  const qualityColors = {
                    excellent: 'bg-green-100 text-green-700',
                    good: 'bg-blue-100 text-blue-700',
                    fair: 'bg-yellow-100 text-yellow-700',
                    poor: 'bg-red-100 text-red-700'
                  };
                  
                  return (
                    <div key={meal.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{meal.meal_type || meal.mealType}</div>
                        <div className="text-sm text-gray-600">
                          {meal.description ? meal.description.substring(0, 50) + '...' : 'No description'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(meal.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${qualityColors[quality]}`}>
                        {quality}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No recent meals logged</p>
            )}
          </div>

          {/* Performance Metrics */}
          {player.lastWeekPerformance && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Last Week Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {player.lastWeekPerformance.energyLevel}/10
                  </div>
                  <div className="text-sm text-gray-600">Avg Energy</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Moon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {player.lastWeekPerformance.sleepHours}h
                  </div>
                  <div className="text-sm text-gray-600">Avg Sleep</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {player.lastWeekPerformance.trainingDays}
                  </div>
                  <div className="text-sm text-gray-600">Training Days</div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-900">Coach Recommendations</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              {player.complianceRate < 70 && (
                <li>• Encourage more consistent meal logging (current: {player.complianceRate}%)</li>
              )}
              {player.weekAvgScore < 70 && (
                <li>• Focus on improving food quality choices</li>
              )}
              {player.lastWeekPerformance && player.lastWeekPerformance.sleepHours < 8 && (
                <li>• Recommend getting more sleep (current avg: {player.lastWeekPerformance.sleepHours}h)</li>
              )}
              {player.currentStreak === 0 && (
                <li>• Help restart daily tracking habit</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CoachDashboard() {
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'lowCompliance' | 'highPerformers'>('all');

  useEffect(() => {
    // Load player data when component mounts
    fetchPlayersData();
  }, []);

  const fetchPlayersData = async () => {
    setLoading(true);
    try {
      // Fetch real data from Supabase
      // For now, we'll show the current user's data as if they were a player
      // In production, this would fetch all team members' data
      
      const foodResponse = await supabaseAPI.food.getEntries();
      const perfResponse = await supabaseAPI.performance.getEntries();
      const statsResponse = await supabaseAPI.userStats.get();
      
      // Calculate stats from real data
      const today = new Date().toDateString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      let todayMeals = 0;
      let weekMeals: any[] = [];
      let totalMealsLogged = 0;
      
      if (foodResponse.success && foodResponse.data) {
        const allMeals = foodResponse.data || [];
        todayMeals = allMeals.filter((entry: any) => 
          new Date(entry.created_at).toDateString() === today
        ).length;
        
        weekMeals = allMeals.filter((entry: any) => 
          new Date(entry.created_at) >= weekAgo
        );
        
        totalMealsLogged = allMeals.length;
      }
      
      // Calculate week average score
      let weekAvgScore = 0;
      if (weekMeals.length > 0) {
        const scores = weekMeals.map((meal: any) => {
          const analysis = analyzeFoodQuality(meal.description);
          return analysis.score;
        });
        weekAvgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
      
      // Calculate compliance (expected 5 meals per day for 7 days = 35 meals)
      const expectedMealsPerWeek = 35;
      const complianceRate = Math.round((weekMeals.length / expectedMealsPerWeek) * 100);
      
      // Get performance data
      let lastWeekPerformance = {
        energyLevel: 0,
        sleepHours: 0,
        trainingDays: 0
      };
      
      if (perfResponse.success && perfResponse.data) {
        const weekPerf = (perfResponse.data || []).filter((entry: any) => 
          new Date(entry.created_at) >= weekAgo
        );
        
        if (weekPerf.length > 0) {
          const avgEnergy = weekPerf.reduce((sum: number, p: any) => 
            sum + (p.energy_level || 0), 0) / weekPerf.length;
          const avgSleep = weekPerf.reduce((sum: number, p: any) => 
            sum + (p.sleep_hours || 0), 0) / weekPerf.length;
          const trainingDays = weekPerf.filter((p: any) => 
            p.training_intensity && p.training_intensity > 0
          ).length;
          
          lastWeekPerformance = {
            energyLevel: Math.round(avgEnergy * 10) / 10,
            sleepHours: Math.round(avgSleep * 10) / 10,
            trainingDays
          };
        }
      }
      
      // Get user stats for streak
      let currentStreak = 0;
      if (statsResponse.data) {
        currentStreak = statsResponse.data.current_streak || 0;
      }
      
      // Create player data from current user
      const currentUserAsPlayer: PlayerData = {
        id: profile?.id || '1',
        name: profile?.firstName && profile?.lastName 
          ? `${profile.firstName} ${profile.lastName}`
          : profile?.email?.split('@')[0] || 'Current User',
        email: profile?.email || 'user@example.com',
        age: profile?.age || 14,
        ageGroup: profile?.ageGroup || '13-15',
        position: profile?.position || 'PLAYER',
        lastActive: new Date(),
        todayMeals,
        weekAvgScore,
        currentStreak,
        totalMealsLogged,
        complianceRate,
        lastWeekPerformance
      };
      
      // For demonstration, we'll show the current user and some mock teammates
      // In production, this would be real team members
      const players: PlayerData[] = [
        currentUserAsPlayer,
        // Add a few mock teammates with lower stats to show contrast
        {
          id: '2',
          name: 'Teammate 1',
          email: 'teammate1@example.com',
          age: 13,
          ageGroup: '13-15',
          position: 'MIDFIELDER',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
          todayMeals: 2,
          weekAvgScore: 65,
          currentStreak: 1,
          totalMealsLogged: 89,
          complianceRate: 60,
          lastWeekPerformance: {
            energyLevel: 6.0,
            sleepHours: 7.5,
            trainingDays: 3
          }
        },
        {
          id: '3',
          name: 'Teammate 2',
          email: 'teammate2@example.com',
          age: 12,
          ageGroup: '10-12',
          position: 'DEFENDER',
          lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          todayMeals: 0,
          weekAvgScore: 45,
          currentStreak: 0,
          totalMealsLogged: 67,
          complianceRate: 40,
          lastWeekPerformance: {
            energyLevel: 5.5,
            sleepHours: 6.8,
            trainingDays: 2
          }
        }
      ];

      setPlayers(players);
    } catch (error) {
      console.error('Failed to fetch players data:', error);
      // If fetching real data fails, show empty state
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterBy) {
      case 'lowCompliance':
        return player.complianceRate < 70;
      case 'highPerformers':
        return player.weekAvgScore >= 80;
      default:
        return true;
    }
  });

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLastActiveText = (lastActive: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastActive.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
              <p className="text-gray-600">FC Inter P13 2012 - Team Overview</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/team')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Team Settings
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Players</p>
                <p className="text-2xl font-bold">{players.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-2xl font-bold">
                  {players.filter(p => p.todayMeals > 0).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Avg Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(players.reduce((acc, p) => acc + p.weekAvgScore, 0) / players.length)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Need Attention</p>
                <p className="text-2xl font-bold">
                  {players.filter(p => p.complianceRate < 70).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterBy('all')}
                className={`px-4 py-2 rounded-lg ${
                  filterBy === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Players
              </button>
              <button
                onClick={() => setFilterBy('lowCompliance')}
                className={`px-4 py-2 rounded-lg ${
                  filterBy === 'lowCompliance' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Low Compliance
              </button>
              <button
                onClick={() => setFilterBy('highPerformers')}
                className={`px-4 py-2 rounded-lg ${
                  filterBy === 'highPerformers' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                High Performers
              </button>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Players</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Today's Meals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Week Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{player.name}</div>
                        <div className="text-sm text-gray-500">Age {player.age}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{player.position || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UtensilsCrossed className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{player.todayMeals}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${player.weekAvgScore}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">{player.weekAvgScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getComplianceColor(player.complianceRate)}`}>
                        {player.complianceRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getLastActiveText(player.lastActive)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPlayer(player)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}