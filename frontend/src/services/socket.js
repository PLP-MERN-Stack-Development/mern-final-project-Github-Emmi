import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('✅ Socket connected:', this.socket.id);
      }
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.log('❌ Socket disconnected:', reason);
      }
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Chat methods
  joinRoom(roomId) {
    this.emit('joinRoom', { roomId });
  }

  leaveRoom(roomId) {
    this.emit('leaveRoom', { roomId });
  }

  sendMessage(roomId, message) {
    this.emit('sendMessage', { roomId, message });
  }

  onNewMessage(callback) {
    this.on('newMessage', callback);
  }

  // Typing indicator
  typing(roomId) {
    this.emit('typing', { roomId });
  }

  stopTyping(roomId) {
    this.emit('stopTyping', { roomId });
  }

  onTyping(callback) {
    this.on('userTyping', callback);
  }

  onStopTyping(callback) {
    this.on('userStopTyping', callback);
  }

  // Notifications
  subscribeToNotifications(userId) {
    this.emit('subscribeToNotifications', { userId });
  }

  onNotification(callback) {
    this.on('newNotification', callback);
  }

  markAsRead(notificationId) {
    this.emit('markAsRead', { notificationId });
  }

  // Community Feed
  onNewPost(callback) {
    this.on('newPost', callback);
  }

  onPostLiked(callback) {
    this.on('postLiked', callback);
  }

  onNewComment(callback) {
    this.on('newComment', callback);
  }
}

export default new SocketService();
