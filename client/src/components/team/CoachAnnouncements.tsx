import React, { useState, useEffect } from 'react';
import { Bell, Pin, AlertCircle, Info, AlertTriangle, X, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { useUserProfile } from '../../contexts/UserContext';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  authorName: string;
  authorRole: string;
  pinned: boolean;
  createdAt: Date;
  expiresAt?: Date;
  readBy: string[];
}

interface CoachAnnouncementsProps {
  teamId: string;
  userId: string;
  isCoach?: boolean;
}

export default function CoachAnnouncements({ teamId, userId, isCoach = false }: CoachAnnouncementsProps) {
  const { profile } = useUserProfile();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as Announcement['priority'],
    pinned: false,
    expiresIn: 0 // Days until expiry, 0 = no expiry
  });

  // Mock announcements
  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      title: '🏆 Match Day Nutrition Reminder',
      content: 'Remember to eat a balanced meal 3-4 hours before tomorrow\'s match. Focus on complex carbs and lean protein. Stay hydrated throughout the day!',
      priority: 'high',
      authorName: 'Coach Johnson',
      authorRole: 'Head Coach',
      pinned: true,
      createdAt: new Date(Date.now() - 3600000),
      readBy: []
    },
    {
      id: '2',
      title: 'Training Schedule Update',
      content: 'Next week\'s training will start 30 minutes earlier at 3:30 PM. Please adjust your pre-training snacks accordingly.',
      priority: 'normal',
      authorName: 'Coach Smith',
      authorRole: 'Assistant Coach',
      pinned: false,
      createdAt: new Date(Date.now() - 86400000),
      readBy: [userId]
    },
    {
      id: '3',
      title: '⚠️ Hydration Alert',
      content: 'With the hot weather this week, make sure you\'re drinking at least 3 liters of water daily. Bring extra water bottles to training!',
      priority: 'urgent',
      authorName: 'Coach Johnson',
      authorRole: 'Head Coach',
      pinned: true,
      createdAt: new Date(Date.now() - 7200000),
      expiresAt: new Date(Date.now() + 86400000 * 3),
      readBy: []
    }
  ];

  useEffect(() => {
    loadAnnouncements();
  }, [teamId]);

  const loadAnnouncements = async () => {
    try {
      // In production, fetch from API
      // const response = await API.teams.getAnnouncements(teamId);
      // setAnnouncements(response.data);
      
      // For now, use mock data
      setAnnouncements(mockAnnouncements);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  };

  const markAsRead = async (announcementId: string) => {
    try {
      // In production, call API
      // await API.teams.markAnnouncementRead(announcementId);
      
      setAnnouncements(prev => prev.map(a => 
        a.id === announcementId 
          ? { ...a, readBy: [...a.readBy, userId] }
          : a
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const createAnnouncement = async () => {
    if (!formData.title || !formData.content) return;

    const newAnnouncement: Announcement = {
      id: `new-${Date.now()}`,
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
      authorName: profile?.name || 'Coach',
      authorRole: 'Coach',
      pinned: formData.pinned,
      createdAt: new Date(),
      expiresAt: formData.expiresIn > 0 
        ? new Date(Date.now() + formData.expiresIn * 86400000)
        : undefined,
      readBy: []
    };

    try {
      // In production, call API
      // await API.teams.createAnnouncement(teamId, newAnnouncement);
      
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      // In production, call API
      // await API.teams.deleteAnnouncement(id);
      
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      pinned: false,
      expiresIn: 0
    });
    setEditingId(null);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'low':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-300';
      case 'high':
        return 'bg-orange-50 border-orange-300';
      case 'low':
        return 'bg-gray-50 border-gray-300';
      default:
        return 'bg-blue-50 border-blue-300';
    }
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    // Pinned first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // Then by priority
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by date
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const unreadCount = announcements.filter(a => !a.readBy.includes(userId)).length;

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h2 className="text-xl font-bold">Team Announcements</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount} new
              </span>
            )}
          </div>
          {isCoach && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && isCoach && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Announcement title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Announcement content..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Announcement['priority'] })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="rounded"
                />
                <Pin className="w-4 h-4" />
                Pin to top
              </label>
              <input
                type="number"
                min="0"
                placeholder="Expires in (days)"
                value={formData.expiresIn}
                onChange={(e) => setFormData({ ...formData, expiresIn: parseInt(e.target.value) || 0 })}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createAnnouncement}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingId ? 'Update' : 'Post'} Announcement
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

      {/* Announcements List */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {sortedAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No announcements yet</p>
          </div>
        ) : (
          sortedAnnouncements.map((announcement) => {
            const isUnread = !announcement.readBy.includes(userId);
            
            return (
              <div
                key={announcement.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  getPriorityColor(announcement.priority)
                } ${isUnread ? 'border-l-4 border-l-indigo-500' : ''}`}
                onClick={() => isUnread && markAsRead(announcement.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityIcon(announcement.priority)}
                      <h3 className="font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      {announcement.pinned && (
                        <Pin className="w-4 h-4 text-indigo-500" />
                      )}
                      {isUnread && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{announcement.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <span>{announcement.authorName}</span>
                        <span>•</span>
                        <span>{format(announcement.createdAt, 'MMM d, HH:mm')}</span>
                        {announcement.expiresAt && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-orange-600">
                              <Clock className="w-3 h-3" />
                              Expires {format(announcement.expiresAt, 'MMM d')}
                            </span>
                          </>
                        )}
                      </div>
                      {isCoach && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAnnouncement(announcement.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}