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
        <span className={`${sizeClasses[size]} font-medium text-white`}>
          {levelInfo.rank}
        </span>
        <span className={`${sizeClasses[size === 'small' ? 'small' : size]} text-white/80`}>
          Lvl {levelInfo.levelNumber}
        </span>
      </div>
      
      {/* XP display */}
      {showProgress && (
        <div className="flex items-center gap-1">
          <span className={`${sizeClasses[size]} text-white/90`}>
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
        <span className="text-sm text-white/90">
          Level {levelInfo.levelNumber}
        </span>
        <span className="text-sm text-white/70">
          {levelInfo.xpToNextLevel} XP to next
        </span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-white/60 transition-all duration-500"
          style={{ width: `${levelInfo.progressPercent}%` }}
        />
      </div>
    </div>
  );
}