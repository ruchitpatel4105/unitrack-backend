import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Uni-Track Socket.IO server:', socket?.id);
      socket?.emit('admin:join');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
    });
  }
  return socket;
}
