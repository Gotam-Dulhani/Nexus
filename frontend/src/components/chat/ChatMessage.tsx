import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Phone, Video, PhoneMissed } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface ChatMessageProps {
  message: {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    type?: 'text' | 'call';
    subType?: 'voice' | 'video';
    callStatus?: 'missed' | 'rejected' | 'completed';
    senderName?: string;
    senderAvatar?: string;
  };
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      {!isCurrentUser && (
        <Avatar
          src={message.senderAvatar || ''}
          alt={message.senderName || 'User'}
          size="sm"
          className="mr-2 self-end"
        />
      )}
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
            message.type === 'call'
              ? 'bg-gray-100 border border-gray-200 text-gray-800'
              : isCurrentUser
                ? 'bg-primary-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          {message.type === 'call' ? (
            <div className="flex items-center space-x-2 py-1">
              <div className={`p-1.5 rounded-full ${message.callStatus === 'missed' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                {message.subType === 'video' ? <Video size={16} /> : <Phone size={16} />}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium">
                  {message.callStatus === 'missed' ? 'Missed Call' : 'Call ended'}
                </p>
                <p className="text-xs text-gray-500 capitalize">{message.subType} call</p>
              </div>
            </div>
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
        
        <span className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>
      
      {isCurrentUser && (
        <Avatar
          src={message.senderAvatar || ''}
          alt={message.senderName || 'You'}
          size="sm"
          className="ml-2 self-end"
        />
      )}
    </div>
  );
};