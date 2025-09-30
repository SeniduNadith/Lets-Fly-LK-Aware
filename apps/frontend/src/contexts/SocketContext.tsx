import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoleRoom: (role: string) => void;
  leaveRoleRoom: (role: string) => void;
  emitQuizSubmitted: (data: any) => void;
  emitGameCompleted: (data: any) => void;
  emitPolicyAcknowledged: (data: any) => void;
  onQuizUpdate: (callback: (data: any) => void) => void;
  onGameUpdate: (callback: (data: any) => void) => void;
  onPolicyUpdate: (callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoleRoom = (role: string): void => {
    if (socket) {
      socket.emit('join-role', role);
    }
  };

  const leaveRoleRoom = (role: string): void => {
    if (socket) {
      socket.emit('leave-role', role);
    }
  };

  const emitQuizSubmitted = (data: any): void => {
    if (socket) {
      socket.emit('quiz-submitted', data);
    }
  };

  const emitGameCompleted = (data: any): void => {
    if (socket) {
      socket.emit('game-completed', data);
    }
  };

  const emitPolicyAcknowledged = (data: any): void => {
    if (socket) {
      socket.emit('policy-acknowledged', data);
    }
  };

  const onQuizUpdate = (callback: (data: any) => void): void => {
    if (socket) {
      socket.on('quiz-update', callback);
    }
  };

  const onGameUpdate = (callback: (data: any) => void): void => {
    if (socket) {
      socket.on('game-update', callback);
    }
  };

  const onPolicyUpdate = (callback: (data: any) => void): void => {
    if (socket) {
      socket.on('policy-update', callback);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinRoleRoom,
    leaveRoleRoom,
    emitQuizSubmitted,
    emitGameCompleted,
    emitPolicyAcknowledged,
    onQuizUpdate,
    onGameUpdate,
    onPolicyUpdate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
