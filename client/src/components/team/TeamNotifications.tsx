import React, { useState, useEffect } from 'react';
import { Bell, X, Trophy, Users, Target, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { TeamNotification } from '../../services/websocketService';

interface TeamNotificationsProps {
  teamId: string;
  userId: string;
}

export default function TeamNotifications({ teamId, userId }: TeamNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  
  const { notifications, clearNotifications, connected } = useWebSocket({
    teamId,
    autoConnect: true
  });

  // Load read notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`read-notifications-${userId}`);
    if (stored) {
      try {
        setReadNotifications(new Set(JSON.parse(stored)));
      } catch (error) {
        console.error('Failed to load read notifications:', error);
      }
    }
  }, [userId]);

  // Save read notifications to localStorage
  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => {
      const next = new Set(prev);
      next.add(notificationId);
      
      // Save to localStorage
      try {
        localStorage.setItem(`read-notifications-${userId}`, JSON.stringify(Array.from(next)));
      } catch (error) {
        console.error('Failed to save read notifications:', error);
      }
      
      return next;
    });
  };

  // Mark all as read
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
    
    try {
      localStorage.setItem(`read-notifications-${userId}`, JSON.stringify(allIds));
    } catch (error) {
      console.error('Failed to save read notifications:', error);
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  // Get notification icon
  const getNotificationIcon = (type: TeamNotification['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'challenge_created':
      case 'challenge_completed':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'announcement':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'member_joined':
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get notification color
  const getNotificationColor = (type: TeamNotification['type']) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      case 'challenge_created':
      case 'challenge_completed':
        return 'bg-purple-50 border-purple-200';
      case 'announcement':
        return 'bg-blue-50 border-blue-200';
      case 'member_joined':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {!connected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Connection Status */}
            {!connected && (
              <div className="px-4 py-2 bg-orange-50 text-orange-700 text-sm border-b border-orange-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  Connecting to real-time updates...
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm mt-2">
                    You'll see team updates and achievements here
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const isRead = readNotifications.has(notification.id);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !isRead ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => !isRead && markAsRead(notification.id)}
                      >
                        <div className={`flex gap-3 p-3 rounded-lg border ${getNotificationColor(notification.type)}`}>
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                              {!isRead && (
                                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatDistanceToNow(new Date(notification.timestamp), { 
                                  addSuffix: true 
                                })}
                              </span>
                              {isRead && (
                                <>
                                  <span>•</span>
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Read</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 text-center">
                <p className="text-xs text-gray-500">
                  Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}