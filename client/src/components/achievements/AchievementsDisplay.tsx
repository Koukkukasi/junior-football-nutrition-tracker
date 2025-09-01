import React, { useState, useEffect } from 'react';
import type { Achievement } from '../../lib/achievements';
import { achievements, calculateLevel, levelRewards, getRarityColor } from '../../lib/achievements';
import { achievementService } from '../../services/achievementService';
import AchievementBadge from './AchievementBadge';
import { Trophy, Star, TrendingUp, Target, Award, Users } from 'lucide-react';

interface AchievementsDisplayProps {
  userId: string;
  totalXP?: number;
  compact?: boolean;
}

export default function AchievementsDisplay({ userId, totalXP = 0, compact = false }: AchievementsDisplayProps) {
  const [achievementsData, setAchievementsData] = useState<(Achievement & { unlocked: boolean; progress: number })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0
  });

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    // Initialize service if needed
    await achievementService.initialize(userId);
    
    // Get achievements with status
    const achievementsWithStatus = achievementService.getAchievementsWithStatus();
    setAchievementsData(achievementsWithStatus);

    // Calculate stats
    const unlocked = achievementsWithStatus.filter(a => a.unlocked);
    setStats({
      total: achievementsWithStatus.length,
      unlocked: unlocked.length,
      common: unlocked.filter(a => a.rarity === 'common').length,
      rare: unlocked.filter(a => a.rarity === 'rare').length,
      epic: unlocked.filter(a => a.rarity === 'epic').length,
      legendary: unlocked.filter(a => a.rarity === 'legendary').length
    });
  };

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'nutrition', name: 'Nutrition', icon: Target },
    { id: 'consistency', name: 'Consistency', icon: TrendingUp },
    { id: 'performance', name: 'Performance', icon: Star },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'special', name: 'Special', icon: Award }
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievementsData
    : achievementsData.filter(a => a.category === selectedCategory);

  const levelInfo = calculateLevel(totalXP);
  const nextReward = levelRewards.find(r => r.level > levelInfo.level);

  if (compact) {
    // Compact view for dashboard
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Recent Achievements
          </h3>
          <span className="text-sm text-gray-500">
            {stats.unlocked}/{stats.total} Unlocked
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {achievementsData
            .filter(a => a.unlocked)
            .slice(0, 5)
            .map(achievement => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={true}
                progress={100}
                size="small"
              />
            ))}
        </div>

        {achievementsData.filter(a => a.unlocked).length === 0 && (
          <p className="text-gray-500 text-center py-4">
            Start logging meals to unlock achievements!
          </p>
        )}
      </div>
    );
  }

  // Full view for profile page
  return (
    <div className="space-y-6">
      {/* Level Progress Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-2xl font-bold">Level {levelInfo.level}</h2>
            <span className="text-sm opacity-90">{totalXP} Total XP</span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500 rounded-full"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm mt-2 opacity-90">
            <span>{levelInfo.currentXP} XP</span>
            <span>{levelInfo.xpToNext} XP to Level {levelInfo.level + 1}</span>
          </div>
        </div>

        {nextReward && (
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide opacity-75 mb-1">Next Reward at Level {nextReward.level}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{nextReward.icon}</span>
              <span className="font-semibold">{nextReward.reward}</span>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="text-2xl font-bold text-gray-900">{stats.unlocked}/{stats.total}</div>
          <div className="text-sm text-gray-500">Total Unlocked</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.common}</div>
          <div className="text-sm text-gray-500">Common</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.rare}</div>
          <div className="text-sm text-blue-500">Rare</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.epic}</div>
          <div className="text-sm text-purple-500">Epic</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">All Achievements</h3>
        
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {filteredAchievements.map(achievement => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={achievement.unlocked}
              progress={achievement.progress}
              size="medium"
            />
          ))}
        </div>
      </div>

      {/* Legendary Achievements Showcase */}
      {achievementsData.filter(a => a.rarity === 'legendary' && a.unlocked).length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            Legendary Achievements
          </h3>
          <div className="flex gap-4">
            {achievementsData
              .filter(a => a.rarity === 'legendary' && a.unlocked)
              .map(achievement => (
                <div key={achievement.id} className="text-center">
                  <AchievementBadge
                    achievement={achievement}
                    unlocked={true}
                    progress={100}
                    size="large"
                  />
                  <p className="mt-2 text-sm font-bold text-gray-700">{achievement.name}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}