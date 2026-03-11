import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface EntrepreneurCardProps {
  entrepreneur: any;
  showActions?: boolean;
}

export const EntrepreneurCard: React.FC<EntrepreneurCardProps> = ({
  entrepreneur,
  showActions = true
}) => {
  const navigate = useNavigate();
  const userId = entrepreneur.user?._id || entrepreneur.id;

  const handleViewProfile = () => {
    navigate(`/profile/entrepreneur/${userId}`);
  };
  
  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/${userId}`);
  };

  const handleSchedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/meetings', { 
      state: { 
        attendeeId: userId, 
        attendeeName: entrepreneur.user?.name || 'Entrepreneur' 
      } 
    });
  };
  
  return (
    <Card 
      hoverable 
      className="transition-all duration-300 h-full"
      onClick={handleViewProfile}
    >
      <CardBody className="flex flex-col">
        <div className="flex items-start">
          <Avatar
            src={entrepreneur.avatar}
            alt={entrepreneur.user?.name}
            size="lg"
            className="mr-4"
          />
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{entrepreneur.startupName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{entrepreneur.industry} • {entrepreneur.location}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="primary" size="sm">{entrepreneur.industry || 'Tech'}</Badge>
              <Badge variant="gray" size="sm">{entrepreneur.location || 'Global'}</Badge>
              {entrepreneur.foundedYear && (
                <Badge variant="accent" size="sm">Founded {entrepreneur.foundedYear}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Pitch Summary</h4>
          <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{entrepreneur.pitchSummary || entrepreneur.bio}</p>
        </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Funding Need</span>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{entrepreneur.fundingNeeded || 'TBD'}</p>
          </div>
          
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Team Size</span>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{entrepreneur.teamSize || '1'} people</p>
          </div>
        </div>
      </CardBody>
      
      {showActions && (
        <CardFooter className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageCircle size={16} />}
            onClick={handleMessage}
            className="flex-1"
          >
            Message
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Calendar size={16} />}
            onClick={handleSchedule}
            className="flex-1"
          >
            Meet
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ExternalLink size={16} />}
            onClick={handleViewProfile}
            className="flex-1"
          >
            Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};