import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth, BACKEND_URL } from './AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Check, X } from 'lucide-react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      console.log(`[SocketContext] Connecting for user ${user.id}...`);
      
      // Connect to the backend URL (without /api suffix)
      const newSocket = io(BACKEND_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('[SocketContext] Connected!', newSocket.id);
        setIsConnected(true);
        newSocket.emit('register', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('[SocketContext] Disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('[SocketContext] Connection error:', err);
      });

      newSocket.on('incoming-call', (data) => {
        console.log('[SocketContext] Incoming call alert:', data);
        setIncomingCall(data);
      });

      newSocket.on('call-accepted', ({ roomId }) => {
        console.log('[SocketContext] Call accepted, navigating to:', roomId);
        navigate(`/call/${roomId}`);
      });

      newSocket.on('call-rejected', () => {
        toast.dismiss();
        toast.error('Call was rejected');
      });

      newSocket.on('call-error', ({ message }) => {
        toast.dismiss();
        toast.error(message || 'Call failed');
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        console.log('[SocketContext] Cleaning up socket...');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
       if (socketRef.current) {
         socketRef.current.disconnect();
         setSocket(null);
         setIsConnected(false);
       }
    }
  }, [token, user?.id, navigate]);

  const handleAccept = () => {
    if (!incomingCall || !socket) return;
    socket.emit('accept-call', {
      targetUserId: incomingCall.from,
      roomId: incomingCall.roomId
    });
    navigate(`/call/${incomingCall.roomId}`);
    setIncomingCall(null);
  };

  const handleReject = () => {
    if (!incomingCall || !socket) return;
    socket.emit('reject-call', {
      targetUserId: incomingCall.from
    });
    setIncomingCall(null);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
      
      {incomingCall && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full animate-bounce">
            <Avatar src={incomingCall.callerAvatar || ''} alt={incomingCall.callerName || 'User'} size="xl" className="mb-4" />
            <h3 className="text-xl font-bold text-gray-900">{incomingCall.callerName}</h3>
            <p className="text-gray-500 mb-6">Incoming {incomingCall.type} call...</p>
            <div className="flex space-x-4 w-full">
              <Button 
                variant="primary" 
                fullWidth 
                className="bg-green-600 hover:bg-green-700"
                leftIcon={<Check size={20} />}
                onClick={handleAccept}
              >
                Accept
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                className="text-red-600 border-red-200 hover:bg-red-50"
                leftIcon={<X size={20} />}
                onClick={handleReject}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
