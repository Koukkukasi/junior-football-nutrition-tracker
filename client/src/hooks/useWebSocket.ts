/**
 * React Hook for WebSocket Integration
 * Provides WebSocket functionality to React components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, ChatMessage, TypingIndicator, TeamNotification } from '../services/websocketService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useUserProfile } from '../contexts/UserContext';

interface UseWebSocketOptions {
  teamId?: string;
  autoConnect?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onNotification?: (notification: TeamNotification) => void;
  onTyping?: (indicator: TypingIndicator) => void;
}

interface UseWebSocketReturn {
  connected: boolean;
  connecting: boolean;
  messages: ChatMessage[];
  typingUsers: Map<string, TypingIndicator>;
  notifications: TeamNotification[];
  sendMessage: (content: string, messageType?: ChatMessage['messageType']) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearNotifications: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { teamId, autoConnect = true, onMessage, onNotification, onTyping } = options;
  const { user } = useSupabaseAuth();
  const { profile } = useUserProfile();
  
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
  const [notifications, setNotifications] = useState<TeamNotification[]>([]);
  
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingRef = useRef<number>(0);
  const unsubscribeRef = useRef<(() => void)[]>([]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!user?.id || connecting || connected) return;
    
    setConnecting(true);
    try {
      await websocketService.connect(user.id, teamId);
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    } finally {
      setConnecting(false);
    }
  }, [user?.id, teamId, connecting, connected]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setConnected(false);
    setMessages([]);
    setTypingUsers(new Map());
    setNotifications([]);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    content: string, 
    messageType: ChatMessage['messageType'] = 'text'
  ): Promise<void> => {
    if (!connected || !user?.id || !teamId || !profile) {
      throw new Error('Not connected or missing data');
    }

    const message = {
      teamId,
      userId: user.id,
      userName: profile.name || user.email?.split('@')[0] || 'User',
      userRole: profile.role,
      content,
      messageType
    };

    try {
      const sentMessage = await websocketService.sendMessage(message);
      // Optimistically add message (server will broadcast it back)
      setMessages(prev => [...prev, sentMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [connected, user, teamId, profile]);

  // Edit a message
  const editMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    if (!connected) {
      throw new Error('Not connected');
    }

    try {
      await websocketService.editMessage(messageId, content);
      // Optimistically update message
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content, edited: true } : msg
      ));
    } catch (error) {
      console.error('Failed to edit message:', error);
      throw error;
    }
  }, [connected]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!connected) {
      throw new Error('Not connected');
    }

    try {
      await websocketService.deleteMessage(messageId);
      // Optimistically remove message
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, [connected]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!connected || !user?.id || !teamId || !profile) return;
    
    const now = Date.now();
    
    if (isTyping) {
      // Throttle typing indicators to once per second
      if (now - lastTypingRef.current < 1000) return;
      lastTypingRef.current = now;
      
      // Clear existing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      // Send typing start
      websocketService.sendTypingIndicator(
        teamId,
        user.id,
        profile.name || 'User',
        true
      );
      
      // Auto-stop typing after 2 seconds
      typingTimerRef.current = setTimeout(() => {
        websocketService.sendTypingIndicator(
          teamId,
          user.id,
          profile.name || 'User',
          false
        );
        typingTimerRef.current = null;
      }, 2000);
    } else {
      // Clear timer and send stop
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      
      websocketService.sendTypingIndicator(
        teamId,
        user.id,
        profile.name || 'User',
        false
      );
    }
  }, [connected, user, teamId, profile]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!connected) return;

    // Message events
    const unsubMessage = websocketService.on('message:new', (message: ChatMessage) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      onMessage?.(message);
    });

    const unsubEdit = websocketService.on('message:edited', (message: ChatMessage) => {
      setMessages(prev => prev.map(m => m.id === message.id ? message : m));
    });

    const unsubDelete = websocketService.on('message:deleted', (messageId: string) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });

    // Typing events
    const unsubTypingStart = websocketService.on('typing:start', (indicator: TypingIndicator) => {
      if (indicator.userId === user?.id) return; // Don't show own typing
      
      setTypingUsers(prev => {
        const next = new Map(prev);
        next.set(indicator.userId, indicator);
        return next;
      });
      onTyping?.(indicator);
    });

    const unsubTypingStop = websocketService.on('typing:stop', (indicator: TypingIndicator) => {
      setTypingUsers(prev => {
        const next = new Map(prev);
        next.delete(indicator.userId);
        return next;
      });
    });

    // Notification events
    const unsubNotification = websocketService.on('notification:team', (notification: TeamNotification) => {
      setNotifications(prev => [notification, ...prev]);
      onNotification?.(notification);
    });

    // Achievement events
    const unsubAchievement = websocketService.on('achievement:unlocked', (achievement: any) => {
      const notification: TeamNotification = {
        id: `achievement-${Date.now()}`,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `${achievement.userName} unlocked "${achievement.name}"`,
        data: achievement,
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      onNotification?.(notification);
    });

    // Store unsubscribe functions
    unsubscribeRef.current = [
      unsubMessage,
      unsubEdit,
      unsubDelete,
      unsubTypingStart,
      unsubTypingStop,
      unsubNotification,
      unsubAchievement
    ];

    return () => {
      // Clean up all subscriptions
      unsubscribeRef.current.forEach(unsub => unsub());
      unsubscribeRef.current = [];
    };
  }, [connected, user?.id, onMessage, onNotification, onTyping]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && user?.id && !connected && !connecting) {
      connect();
    }

    return () => {
      // Clean up typing timer on unmount
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [autoConnect, user?.id, connect, connected, connecting]);

  // Handle connection state changes
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const isConnected = websocketService.isConnected();
      if (isConnected !== connected) {
        setConnected(isConnected);
      }
    }, 1000);

    return () => clearInterval(checkConnection);
  }, [connected]);

  return {
    connected,
    connecting,
    messages,
    typingUsers,
    notifications,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTypingIndicator,
    connect,
    disconnect,
    clearNotifications
  };
}