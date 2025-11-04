import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Session-specific methods
  joinSession(sessionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-session', sessionId);
    }
  }

  leaveSession(sessionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-session', sessionId);
    }
  }

  // Attendance events
  onAttendanceUpdate(callback) {
    if (this.socket) {
      this.socket.on('attendance-updated', callback);
    }
  }

  onBulkAttendanceUpdate(callback) {
    if (this.socket) {
      this.socket.on('bulk-attendance-updated', callback);
    }
  }

  emitAttendanceUpdate(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('attendance-update', data);
    }
  }

  emitBulkAttendanceUpdate(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('bulk-attendance-update', data);
    }
  }

  // Tournament methods (existing)
  joinTournament(tournamentId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-tournament', tournamentId);
    }
  }

  joinMatch(matchId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-match', matchId);
    }
  }

  // Generic event listeners
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

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;