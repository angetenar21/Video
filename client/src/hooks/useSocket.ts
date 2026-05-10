import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(): Socket {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    socketRef.current = io('/stream', {
      transports: ['websocket', 'polling'],
    });
  }

  useEffect(() => {
    const socket = socketRef.current!;
    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
}
