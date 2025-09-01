import React, { useEffect, useState } from 'react';
import type { Achievement } from '../../lib/achievements';
import { getRarityColor } from '../../lib/achievements';
import { Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);
    
    // Fire confetti for epic and legendary achievements
    if (achievement.rarity === 'epic' || achievement.rarity === 'legendary') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: achievement.rarity === 'legendary' 
          ? ['#FFD700', '#FFA500', '#FF6347'] 
          : ['#9333EA', '#A855F7', '#C084FC']
      });
    }

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [achievement.rarity]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`bg-white rounded-xl shadow-2xl p-6 max-w-sm border-4 ${
        achievement.rarity === 'legendary' ? 'border-yellow-500' :
        achievement.rarity === 'epic' ? 'border-purple-600' :
        achievement.rarity === 'rare' ? 'border-blue-500' :
        'border-gray-400'
      }`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Achievement Unlocked!</p>
            <h3 className="text-xl font-bold text-gray-900">{achievement.name}</h3>
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl ${
            getRarityColor(achievement.rarity)
          } shadow-lg transform animate-bounce`}>
            {achievement.icon}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-center mb-4">{achievement.description}</p>

        {/* Rewards */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">XP Reward</span>
            <span className="text-lg font-bold text-yellow-600">+{achievement.xpReward} XP</span>
          </div>
        </div>

        {/* Rarity Indicator */}
        <div className="mt-3 text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
            getRarityColor(achievement.rarity)
          }`}>
            {achievement.rarity.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}