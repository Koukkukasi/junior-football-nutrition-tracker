/**
 * WebSocket Service for Real-time Communication
 * Handles team chat, notifications, and live updates
 */

import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userRole?: string;
  content: string;
  messageType: 'text' | 'announcement' | 'achievement' | 'system';
  timestamp: Date;
  edited?: boolean;
  metadata?: any;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  teamId: string;
}

export interface TeamNotification {
  id: string;
  type: 'challenge_created' | 'challenge_completed' | 'announcement' | 'achievement' | 'member_joined';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

class WebSocketService {
  private socket: Socket | null = null;
  private serverUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId: string, teamId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(this.serverUrl, {
        auth: {
          userId,
          teamId
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Join team room if teamId provided
        if (teamId) {
          this.joinTeam(teamId);
        }
        
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to server'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, attempt reconnect
          this.socket?.connect();
        }
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    // Chat message events
    this.socket.on('message:new', (message: ChatMessage) => {
      this.emit('message:new', message);
    });

    this.socket.on('message:edited', (message: ChatMessage) => {
      this.emit('message:edited', message);
    });

    this.socket.on('message:deleted', (messageId: string) => {
      this.emit('message:deleted', messageId);
    });

    // Typing indicators
    this.socket.on('typing:start', (data: TypingIndicator) => {
      this.emit('typing:start', data);
      
      // Clear existing timeout for this user
      const timeoutKey = `${data.teamId}-${data.userId}`;
      if (this.typingTimeouts.has(timeoutKey)) {
        clearTimeout(this.typingTimeouts.get(timeoutKey)!);
      }
      
      // Set timeout to clear typing indicator after 3 seconds
      const timeout = setTimeout(() => {
        this.emit('typing:stop', data);
        this.typingTimeouts.delete(timeoutKey);
      }, 3000);
      
      this.typingTimeouts.set(timeoutKey, timeout);
    });

    this.socket.on('typing:stop', (data: TypingIndicator) => {
      this.emit('typing:stop', data);
      
      // Clear timeout if exists
      const timeoutKey = `${data.teamId}-${data.userId}`;
      if (this.typingTimeouts.has(timeoutKey)) {
        clearTimeout(this.typingTimeouts.get(timeoutKey)!);
        this.typingTimeouts.delete(timeoutKey);
      }
    });

    // Team notifications
    this.socket.on('notification:team', (notification: TeamNotification) => {
      this.emit('notification:team', notification);
    });

    // Challenge updates
    this.socket.on('challenge:updated', (challenge: any) => {
      this.emit('challenge:updated', challenge);
    });

    this.socket.on('challenge:joined', (data: { challengeId: string; userId: string; userName: string }) => {
      this.emit('challenge:joined', data);
    });

    // Announcement updates
    this.socket.on('announcement:new', (announcement: any) => {
      this.emit('announcement:new', announcement);
    });

    this.socket.on('announcement:deleted', (announcementId: string) => {
      this.emit('announcement:deleted', announcementId);
    });

    // Member events
    this.socket.on('member:joined', (member: any) => {
      this.emit('member:joined', member);
    });

    this.socket.on('member:left', (memberId: string) => {
      this.emit('member:left', memberId);
    });

    // Achievement unlocked
    this.socket.on('achievement:unlocked', (achievement: any) => {
      this.emit('achievement:unlocked', achievement);
    });
  }

  /**
   * Join a team room
   */
  joinTeam(teamId: string) {
    if (!this.socket?.connected) {
      console.error('Cannot join team: WebSocket not connected');
      return;
    }
    
    this.socket.emit('team:join', teamId);
  }

  /**
   * Leave a team room
   */
  leaveTeam(teamId: string) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('team:leave', teamId);
  }

  /**
   * Send a chat message
   */
  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit('message:send', message, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      });
    });
  }

  /**
   * Edit a message
   */
  editMessage(messageId: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit('message:edit', { messageId, content }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit('message:delete', messageId, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(teamId: string, userId: string, userName: string, isTyping: boolean) {
    if (!this.socket?.connected) return;
    
    const event = isTyping ? 'typing:start' : 'typing:stop';
    this.socket.emit(event, { teamId, userId, userName });
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to local listeners
   */
  private emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    // Clear all typing timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    // Clear all listeners
    this.listeners.clear();
    
    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get connection state
   */
  getConnectionState(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }

  /**
   * Reconnect to server
   */
  reconnect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();