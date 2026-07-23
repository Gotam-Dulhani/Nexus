import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';
import { Avatar } from '../../components/ui/Avatar';

interface Conversation {
  partner: { _id: string; name: string; role?: string; avatar?: string; isPlaceholder?: boolean };
  lastMessage: { content: string; createdAt: string };
}

export const MessagesPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.conversations || data;
          setConversations(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error('Failed to fetch conversations', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      {conversations.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {conversations.map((conv) => (
            <button
              key={conv.partner._id}
              onClick={() => navigate(`/chat/${conv.partner._id}`)}
              className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <Avatar
                src={conv.partner.avatar}
                alt={conv.partner.name}
                size="md"
                className="mr-3"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{conv.partner.name}</h3>
                  {conv.lastMessage && (
                    <span className="text-xs text-gray-400">
                      {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="text-sm text-gray-500 truncate mt-0.5">{conv.lastMessage.content}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <MessageCircle size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900">No messages yet</h2>
          <p className="text-gray-600 text-center mt-2">
            Start connecting with entrepreneurs and investors to begin conversations
          </p>
        </div>
      )}
    </div>
  );
};