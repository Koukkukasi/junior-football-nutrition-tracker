import { getLevelInfo, formatXP } from '../../lib/gamification';

interface LevelBadgeProps {
  totalXP: number;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export function LevelBadge({ totalXP, size = 'medium', showProgress = true }: LevelBadgeProps) {
  const levelInfo = getLevelInfo(totalXP);
  
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };
  
  return (
    <div className="inline-flex items-center gap-2">
      {/* Level emoji and rank */}
      <div className="flex items-center gap-1">
        <span className={`${sizeClasses[size]} font-semibold`}>
          {levelInfo.emoji}
        </span>
        <span className={`${sizeClasses[size]} font-medium text-gray-700`}>
          {levelInfo.rank}
        </span>
        <span className={`${sizeClasses[size === 'small' ? 'small' : size]} text-gray-500`}>
          Lvl {levelInfo.levelNumber}
        </span>
      </div>
      
      {/* XP display */}
      {showProgress && (
        <div className="flex items-center gap-1">
          <span className={`${sizeClasses[size]} text-gray-600`}>
            {formatXP(totalXP)} XP
          </span>
        </div>
      )}
    </div>
  );
}

export function LevelProgressBar({ totalXP }: { totalXP: number }) {
  const levelInfo = getLevelInfo(totalXP);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">
          Level {levelInfo.levelNumber} - {levelInfo.rank}
        </span>
        <span className="text-xs text-gray-500">
          {levelInfo.xpToNextLevel} XP to next level
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          style={{ width: `${levelInfo.progressPercent}%` }}
        />
      </div>
    </div>
  );
}