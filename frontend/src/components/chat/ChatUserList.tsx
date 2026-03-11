import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

interface ChatUserListProps {
  conversations: any[]; // { partner: User, lastMessage?: Message }
}

export const ChatUserList: React.FC<ChatUserListProps> = ({ conversations }) => {
  const navigate = useNavigate();
  const { userId: activeUserId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  return (
    <div className="bg-white dark:bg-gray-900 w-full overflow-y-auto">
      <div className="py-4">
        <h2 className="px-4 text-lg font-semibold text-gray-800 dark:text-white mb-4">Messages</h2>
        
        <div className="space-y-1">
          {conversations.length > 0 ? (
            conversations.map((conversation, idx) => {
              const { partner, lastMessage } = conversation;
              if (!partner) return null;
              
              const isActive = activeUserId === partner._id;
              
              return (
                <div
                  key={partner._id || idx}
                  className={`px-4 py-3 flex cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/10 border-l-4 border-primary-600 dark:border-primary-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                  }`}
                  onClick={() => navigate(`/chat/${partner._id}`)}
                >
                  <Avatar
                    src={partner.avatar || partner.avatarUrl}
                    alt={partner.name}
                    size="md"
                    status="online"
                    className="mr-3 flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {partner.name}
                      </h3>
                      
                      {lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(lastMessage.createdAt || lastMessage.timestamp), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      {lastMessage && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {lastMessage.sender === currentUser.id ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">No conversations yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};