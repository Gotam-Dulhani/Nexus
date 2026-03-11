import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SOCKET_URL = window.location.origin;

interface PeerInfo {
  socketId: string;
  userId: string;
  userName: string;
}

export const VideoCallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [status, setStatus] = useState<'connecting' | 'waiting' | 'connected' | 'ended'>('connecting');

  const ICE_SERVERS = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  const createPeerConnection = useCallback((targetSocketId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus('connected');
      }
    };

    // Relay ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          targetSocketId,
          candidate: event.candidate
        });
      }
    };

    return pc;
  }, []);

  useEffect(() => {
    if (!user || !roomId) return;

    const startCall = async () => {
      try {
        // Get local media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Connect to signaling server
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('join-room', {
            roomId,
            userId: user.id,
            userName: user.name
          });
          setStatus('waiting');
        });

        // Room already has users → we initiate offer to each
        socket.on('room-users', async (roomUsers: PeerInfo[]) => {
          setPeers(roomUsers);
          for (const peer of roomUsers) {
            const pc = createPeerConnection(peer.socketId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', { targetSocketId: peer.socketId, offer });
          }
        });

        // New user joined → they'll send us an offer
        socket.on('user-joined', ({ socketId, userId: uid, userName }: PeerInfo) => {
          setPeers(prev => [...prev, { socketId, userId: uid, userName }]);
        });

        // Receive offer → send answer
        socket.on('offer', async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
          const pc = createPeerConnection(from);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { targetSocketId: from, answer });
          setStatus('connected');
        });

        // Receive answer
        socket.on('answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        // Receive ICE candidates
        socket.on('ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        // Peer left
        socket.on('user-left', ({ socketId }: { socketId: string }) => {
          setPeers(prev => prev.filter(p => p.socketId !== socketId));
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          setStatus('waiting');
        });

      } catch (err) {
        console.error('Failed to start video call:', err);
        setStatus('ended');
      }
    };

    startCall();

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      peerConnectionRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, [user, roomId, createPeerConnection]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        socketRef.current?.emit('toggle-media', { roomId, type: 'audio', enabled: audioTrack.enabled });
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
        socketRef.current?.emit('toggle-media', { roomId, type: 'video', enabled: videoTrack.enabled });
      }
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();
    socketRef.current?.disconnect();
    setStatus('ended');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Room info */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div>
          <p className="text-white font-semibold text-sm">Room: {roomId}</p>
          <p className="text-gray-400 text-xs">
            {status === 'connecting' && '⏳ Connecting...'}
            {status === 'waiting' && '⏳ Waiting for others to join...'}
            {status === 'connected' && '🟢 Connected'}
            {status === 'ended' && '🔴 Call Ended'}
          </p>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <Users size={14} />
          <span>{peers.length + 1} in room</span>
        </div>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {/* Local video */}
        <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2">
            <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
              You {isMuted && '(muted)'}
            </span>
          </div>
        </div>

        {/* Remote video */}
        <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {status !== 'connected' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Waiting for participant...</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-colors ${isCameraOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        >
          {isCameraOff ? <VideoOff size={22} className="text-white" /> : <Video size={22} className="text-white" />}
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          title="End call"
        >
          <PhoneOff size={22} className="text-white" />
        </button>
      </div>
    </div>
  );
};
