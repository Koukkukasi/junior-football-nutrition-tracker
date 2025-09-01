import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Bell, Trophy, User, Pin, Clock } from 'lucide-react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useUserProfile } from '../../contexts/UserContext';
import { format, isToday, isYesterday } from 'date-fns';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userRole?: 'PLAYER' | 'COACH' | 'ADMIN';
  content: string;
  messageType: 'text' | 'announcement' | 'challenge' | 'achievement';
  timestamp: Date;
  edited?: boolean;
  metadata?: any;
}

interface TeamChatProps {
  teamId: string;
  teamName?: string;
}

export default function TeamChat({ teamId, teamName = 'Team' }: TeamChatProps) {
  const { user } = useSupabaseAuth();
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Mock messages for demonstration
  const mockMessages: Message[] = [
    {
      id: '1',
      userId: 'coach1',
      userName: 'Coach Johnson',
      userRole: 'COACH',
      content: '🎯 Great job on yesterday\'s training everyone! Remember to log your recovery meals.',
      messageType: 'text',
      timestamp: new Date(Date.now() - 3600000 * 3)
    },
    {
      id: '2',
      userId: 'player1',
      userName: 'Emma V.',
      userRole: 'PLAYER',
      content: 'Just logged my breakfast! Feeling energized for today\'s match 💪',
      messageType: 'text',
      timestamp: new Date(Date.now() - 3600000 * 2)
    },
    {
      id: '3',
      userId: 'system',
      userName: 'System',
      content: 'Emma V. unlocked achievement: "7-Day Streak" 🔥',
      messageType: 'achievement',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '4',
      userId: 'coach1',
      userName: 'Coach Johnson',
      userRole: 'COACH',
      content: '📢 Team meeting at 4 PM today. We\'ll discuss nutrition goals for next week.',
      messageType: 'announcement',
      timestamp: new Date(Date.now() - 1800000)
    }
  ];

  useEffect(() => {
    // Load messages
    loadMessages();
    
    // Scroll to bottom
    scrollToBottom();
  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // const response = await API.teams.getMessages(teamId);
      // setMessages(response.data);
      
      // For now, use mock data
      setTimeout(() => {
        setMessages(mockMessages);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      userId: user?.id || '',
      userName: profile?.name || user?.email?.split('@')[0] || 'User',
      userRole: profile?.role as 'PLAYER' | 'COACH' | 'ADMIN',
      content: newMessage,
      messageType: 'text',
      timestamp: new Date()
    };

    // Optimistically add message
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      // In production, send to API
      // await API.teams.sendMessage(teamId, { content: newMessage });
      
      // Simulate sending
      setTimeout(() => {
        setSending(false);
      }, 300);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(tempMessage.content);
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, 'HH:mm');
    } else if (isYesterday(timestamp)) {
      return `Yesterday ${format(timestamp, 'HH:mm')}`;
    } else {
      return format(timestamp, 'MMM d, HH:mm');
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'challenge':
        return <Trophy className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'COACH':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">{teamName} Chat</h2>
          </div>
          <span className="text-sm opacity-90">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px] min-h-[400px] bg-gray-50"
      >
        {messages.map((message) => {
          const isOwnMessage = message.userId === user?.id;
          const isSystemMessage = message.messageType === 'achievement';
          const isAnnouncement = message.messageType === 'announcement';

          if (isSystemMessage) {
            return (
              <div key={message.id} className="flex justify-center my-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  {message.content}
                </div>
              </div>
            );
          }

          if (isAnnouncement) {
            return (
              <div key={message.id} className="my-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-blue-900">{message.userName}</span>
                        {message.userRole && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(message.userRole)}`}>
                            {message.userRole}
                          </span>
                        )}
                        <Pin className="w-3 h-3 text-blue-500" />
                      </div>
                      <p className="text-gray-800">{message.content}</p>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">{message.userName}</span>
                    {message.userRole && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleColor(message.userRole)}`}>
                        {message.userRole}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.edited && (
                    <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                      (edited)
                    </span>
                  )}
                </div>
                <span className={`text-xs text-gray-500 mt-1 inline-block ${
                  isOwnMessage ? 'text-right' : 'text-left'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white rounded-b-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`p-2 rounded-full transition-all ${
              newMessage.trim() && !sending
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}