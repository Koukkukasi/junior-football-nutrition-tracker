import React from 'react';
import type { Achievement } from '../../lib/achievements';
import { getRarityColor, getRarityBorder } from '../../lib/achievements';
import { Lock, CheckCircle } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  progress: number;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function AchievementBadge({ 
  achievement, 
  unlocked, 
  progress, 
  onClick,
  size = 'medium' 
}: AchievementBadgeProps) {
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-20 h-20 text-3xl',
    large: 'w-24 h-24 text-4xl'
  };

  const badgeSize = sizeClasses[size];

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer transition-transform hover:scale-110 ${
        unlocked ? '' : 'opacity-60'
      }`}
      title={achievement.name}
    >
      {/* Badge Container */}
      <div
        className={`${badgeSize} rounded-full flex items-center justify-center relative ${
          unlocked ? getRarityColor(achievement.rarity) : 'bg-gray-300'
        } ${getRarityBorder(achievement.rarity)} border-4 shadow-lg`}
      >
        {/* Icon or Lock */}
        <span className="relative z-10 select-none">
          {unlocked ? achievement.icon : <Lock className="w-8 h-8 text-gray-600" />}
        </span>

        {/* Progress Ring (if not unlocked) */}
        {!unlocked && progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="5"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
        )}

        {/* Unlocked Indicator */}
        {unlocked && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
          <div className="font-bold">{achievement.name}</div>
          <div className="text-gray-300">{achievement.description}</div>
          {!unlocked && (
            <div className="text-yellow-400 mt-1">
              Progress: {Math.round(progress)}%
            </div>
          )}
          <div className="text-green-400 mt-1">+{achievement.xpReward} XP</div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}