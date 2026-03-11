import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile, MessageCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth, API_URL } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatPartner, setChatPartner] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const { socket, isConnected } = useSocket();
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  const API = API_URL;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // Socket message listener
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewMessage = (msg: any) => {
        console.log('[Chat] Received new message via global socket:', msg);
        if (msg.sender === userId) {
          setMessages(prev => [...prev, msg]);
        }
        fetchConversations();
      };

      socket.on('new-message', handleNewMessage);
      return () => {
        socket.off('new-message', handleNewMessage);
      };
    }
  }, [socket, isConnected, userId]);

  const fetchConversations = useCallback(async () => {
    try {
      console.log('[Chat] Fetching conversations list...');
      const res = await fetch(`${API}/messages/conversations`, { headers });
      if (res.ok) {
        const data = await res.json();
        console.log('[Chat] Conversations data received:', data);
        
        const convList = data.conversations || data; // Handle both old and new response formats
        
        setConversations(Array.isArray(convList) ? convList.map((c: any) => ({
          partner: c.user,
          lastMessage: c.lastMessage
        })) : []);
      } else {
        const errText = await res.text();
        console.error(`[Chat] Failed to fetch conversations: ${res.status} ${errText}`);
      }
    } catch (e) { 
      console.error('[Chat] Fetch conversations error:', e); 
    }
  }, [token, API]);

  const fetchMessages = useCallback(async () => {
    if (!userId) {
      setChatPartner(null);
      setMessages([]);
      return;
    }
    try {
      const res = await fetch(`${API}/messages/${userId}`, { headers });
      if (res.ok) setMessages(await res.json());
      
      const pRes = await fetch(`${API}/profile/${userId}`, { headers });
      if (pRes.ok) {
        const pData = await pRes.json();
        setChatPartner({
          id: userId,
          name: pData.user.name,
          role: pData.user.role,
          avatarUrl: pData.avatar,
          isOnline: true
        });
      }
    } catch (e) { console.error(e); }
  }, [userId, token, API]);

  useEffect(() => {
    if (token) fetchConversations();
  }, [token, fetchConversations]);

  useEffect(() => {
    if (token && userId) fetchMessages();
  }, [token, userId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !userId) return;

    try {
      const res = await fetch(`${API}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ receiverId: userId, content: newMessage })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
        
        // Notify via socket
        socket?.emit('send-message', {
          receiverId: userId,
          message: msg
        });

        fetchConversations();
      }
    } catch (e) { console.error(e); }
  };

  const handleStartCall = (type: 'voice' | 'video') => {
    if (!socket?.connected) {
      toast.error('Connection not ready. Please wait or refresh.');
      return;
    }
    
    if (!chatPartner) {
      toast.error('Chat partner info not loaded yet.');
      return;
    }

    const roomId = `call_${Date.now()}_${currentUser?.id}`;
    
    console.log('[Chat] Initiating call signal:', { targetUserId: userId, type, roomId });
    setIsCalling(true);
    socket.emit('call-user', {
      targetUserId: userId,
      callerName: currentUser?.name,
      callerAvatar: currentUser?.avatarUrl,
      type,
      roomId
    });

    const callToast = toast.loading(`Calling ${chatPartner.name}...`, { duration: 10000 });
    
    // Auto-clear calling state after 10s if no answer
    setTimeout(() => {
      setIsCalling(false);
      toast.dismiss(callToast);
    }, 10000);
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden animate-fade-in relative">
      {/* Calling Animation Overlay */}
      {isCalling && (
        <div className="absolute inset-0 z-50 bg-primary-900/40 backdrop-blur-md flex items-center justify-center animate-pulse">
          <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center">
             <Avatar 
               src={chatPartner?.avatarUrl} 
               alt={chatPartner?.name || 'User'} 
               size="xl" 
               className="animate-bounce mb-6 border-4 border-primary-500" 
             />
             <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Calling {chatPartner?.name}...</h3>
             <p className="text-gray-500 dark:text-gray-400">Wait for them to answer</p>
             <Button variant="outline" className="mt-8 text-red-600 border-red-200 dark:border-red-900/50" onClick={() => setIsCalling(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Conversations sidebar */}
      <div className="hidden md:block w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
        <ChatUserList conversations={conversations} />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        {chatPartner ? (
          <>
            <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center">
                <Avatar
                  src={chatPartner.avatarUrl}
                  alt={chatPartner.name}
                  size="md"
                  status={chatPartner.isOnline ? 'online' : 'offline'}
                  className="mr-3"
                />
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">{chatPartner.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {chatPartner.isOnline ? 'Online' : 'Away'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600"
                  onClick={() => handleStartCall('voice')}
                >
                  <Phone size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600"
                  onClick={() => handleStartCall('video')}
                >
                  <Video size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600"
                  onClick={() => navigate(`/profile/${chatPartner.role}/${userId}`)}
                >
                  <Info size={18} />
                </Button>
              </div>
            </div>
            
            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <ChatMessage
                      key={message._id || idx}
                      message={{
                        id: message._id,
                        senderId: message.sender,
                        content: message.content,
                        timestamp: message.createdAt,
                        senderName: message.sender === currentUser.id ? currentUser.name : (chatPartner?.name || 'User'),
                        senderAvatar: message.sender === currentUser.id ? currentUser.avatarUrl : chatPartner?.avatarUrl
                      }}
                      isCurrentUser={message.sender === currentUser.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No messages yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Send a message to start the conversation</p>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-full p-2"><Smile size={20} /></Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  fullWidth
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim()}
                  className="rounded-full p-2 w-10 h-10 flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-sm mb-4">
              <MessageCircle size={48} className="text-primary-500" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">Your Conversations</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-sm">
              Select a contact from the list or visit their profile to start a new chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};