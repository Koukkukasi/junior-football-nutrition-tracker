/**
 * Stats Cards Component
 * Displays system statistics in card format
 */

import React from 'react';
import { Users, Activity, Mail, MessageSquare, TrendingUp } from 'lucide-react';
import type { SystemStats } from '../../types/admin.types';

interface StatsCardsProps {
  stats: SystemStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      subtitle: `${stats.activeToday} active today`
    },
    {
      title: 'Pending Invites',
      value: stats.pendingInvites,
      icon: Mail,
      color: 'yellow',
      subtitle: 'Awaiting response'
    },
    {
      title: 'Feedback',
      value: stats.totalFeedback,
      icon: MessageSquare,
      color: 'purple',
      subtitle: stats.averageScore > 0 ? `Avg: ${stats.averageScore.toFixed(1)}⭐` : 'No ratings yet'
    },
    {
      title: 'Meals Logged',
      value: stats.totalMeals,
      icon: Activity,
      color: 'green',
      subtitle: 'Total entries'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'purple': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'green': return 'bg-green-100 text-green-600 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                <Icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-500 mt-2">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};