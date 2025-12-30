/**
 * Socket.IO client hook for Next.js
 * Manages connection, auto-reconnect, and event handlers
 */
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface SocketHook {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
}

export function useSocket(url?: string, options: UseSocketOptions = {}): SocketHook {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketUrl = url || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      setIsConnected(true);
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      onError?.(error);
    });

    socketRef.current = socket;
  }, [socketUrl, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit '${event}': socket not connected`);
    }
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      console.log(`📡 Registered listener for '${event}'`);
    }
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
      console.log(`📡 Unregistered listener for '${event}'`);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Función para obtener el socket (evita acceso a ref durante render)
  const getSocket = () => socketRef.current;

  return {
    socket: getSocket(),
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
