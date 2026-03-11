import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface InvestorCardProps {
  investor: any;
  showActions?: boolean;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
  investor,
  showActions = true
}) => {
  const navigate = useNavigate();
  const userId = investor.user?._id || investor.id;
  
  const handleViewProfile = () => {
    navigate(`/profile/investor/${userId}`);
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
        attendeeName: investor.user?.name || 'Investor' 
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
            src={investor.avatar}
            alt={investor.user?.name}
            size="lg"
            className="mr-4"
          />
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{investor.user?.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Investor • {investor.portfolioSize || 0} investments</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {(investor.investmentPreferences || []).map((stage: string, index: number) => (
                <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{investor.bio || 'No biography provided.'}</p>
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