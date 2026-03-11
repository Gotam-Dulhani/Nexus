import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, FileText, DollarSign } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth, API_URL } from '../../context/AuthContext';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
// import { createCollaborationRequest, getRequestsFromInvestor } from '../../data/collaborationRequests';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, token } = useAuth();
  const navigate = useNavigate();
  
  const [entrepreneur, setEntrepreneur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Map backend profile format to expected frontend format
          setEntrepreneur({
            ...data,
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            avatarUrl: data.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
            startupName: data.startupName || 'Startup Name',
            industry: 'Tech',
            location: data.location || 'Unknown',
            foundedYear: new Date(data.createdAt).getFullYear(),
            teamSize: 1,
            fundingNeeded: `$${data.fundingNeeded || 0}`,
            bio: data.bio || 'No bio provided.',
            pitchSummary: 'Solving big problems with technology.',
            isOnline: true
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (id && token) fetchProfile();
  }, [id, token]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Entrepreneur not found</h2>
        <p className="text-gray-600 mt-2">The entrepreneur profile you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard/investor">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }
  
  const isCurrentUser = currentUser?.id === entrepreneur.id;
  const isInvestor = currentUser?.role === 'investor';
  
  const handleMeet = () => {
    navigate('/meetings'); // Or open a modal if I want to be more specific, but for now redirecting to meetings is safer as it has the form
  };
  
  const handleSaveProfile = async (updatedData: any) => {
    try {
      const res = await fetch(`${API_URL}/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      
      if (res.ok) {
        const data = await res.json();
        // Update local state with the saved data
        setEntrepreneur((prev: any) => ({
          ...prev,
          bio: data.bio || prev.bio,
          location: data.location || prev.location,
          startupName: data.startupName || prev.startupName,
          industry: data.industry || prev.industry,
          pitchSummary: data.pitchSummary || prev.pitchSummary
        }));
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={entrepreneur.avatarUrl}
              alt={entrepreneur.name}
              size="xl"
              status={entrepreneur.isOnline ? 'online' : 'offline'}
              className="mx-auto sm:mx-0"
            />
            
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{entrepreneur.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Founder at {entrepreneur.startupName}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">{entrepreneur.industry}</Badge>
                <Badge variant="gray">
                  <MapPin size={14} className="mr-1" />
                  {entrepreneur.location}
                </Badge>
                <Badge variant="accent">
                  <Calendar size={14} className="mr-1" />
                  Founded {entrepreneur.foundedYear}
                </Badge>
                <Badge variant="secondary">
                  <Users size={14} className="mr-1" />
                  {entrepreneur.teamSize} team members
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <>
                <Link to={`/chat/${entrepreneur.id}`}>
                  <Button
                    variant="outline"
                    leftIcon={<MessageCircle size={18} />}
                  >
                    Message
                  </Button>
                </Link>
                
                {isInvestor && (
                  <Button
                    leftIcon={<Calendar size={18} />}
                    onClick={handleMeet}
                  >
                    Schedule Meeting
                  </Button>
                )}
              </>
            )}
            
            {isCurrentUser && (
              <Button
                variant="outline"
                leftIcon={<UserCircle size={18} />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
      
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={entrepreneur}
        onSave={handleSaveProfile}
        role="entrepreneur"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">About</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300">{entrepreneur.bio}</p>
            </CardBody>
          </Card>
          
          {/* Startup Description */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Startup Overview</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">Problem Statement</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {entrepreneur?.pitchSummary?.split('.')[0]}.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">Solution</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {entrepreneur.pitchSummary}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">Market Opportunity</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    The {entrepreneur.industry} market is experiencing significant growth, with a projected CAGR of 14.5% through 2027. Our solution addresses key pain points in this expanding market.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">Competitive Advantage</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    Unlike our competitors, we offer a unique approach that combines innovative technology with deep industry expertise, resulting in superior outcomes for our customers.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Team */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Team</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{entrepreneur.teamSize} members</span>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                  <Avatar
                    src={entrepreneur.avatarUrl}
                    alt={entrepreneur.name}
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{entrepreneur.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Founder & CEO</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                  <Avatar
                    src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                    alt="Team Member"
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Alex Johnson</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">CTO</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                  <Avatar
                    src="https://images.pexels.com/photos/773371/pexels-photo-773371.jpeg"
                    alt="Team Member"
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Jessica Chen</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Head of Product</p>
                  </div>
                </div>
                
                {entrepreneur.teamSize > 3 && (
                  <div className="flex items-center justify-center p-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">+ {entrepreneur.teamSize - 3} more team members</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar - right side */}
        <div className="space-y-6">
          {/* Funding Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Funding</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Round</span>
                  <div className="flex items-center mt-1">
                    <DollarSign size={18} className="text-accent-600 dark:text-accent-400 mr-1" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{entrepreneur.fundingNeeded}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Valuation</span>
                  <p className="text-md font-medium text-gray-900 dark:text-white">$8M - $12M</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Previous Funding</span>
                  <p className="text-md font-medium text-gray-900 dark:text-white">$750K Seed (2022)</p>
                </div>
                
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Funding Timeline</span>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium dark:text-gray-300">Pre-seed</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">Completed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium dark:text-gray-300">Seed</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">Completed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium dark:text-gray-300">Series A</span>
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full">In Progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Documents */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/10 rounded-md mr-3">
                    <FileText size={18} className="text-primary-700 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Pitch Deck</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Updated 2 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/10 rounded-md mr-3">
                    <FileText size={18} className="text-primary-700 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Business Plan</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Updated 1 month ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/10 rounded-md mr-3">
                    <FileText size={18} className="text-primary-700 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Financial Projections</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Updated 2 weeks ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
              
              {!isCurrentUser && isInvestor && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Interested in this startup? Schedule a meeting to discuss potential collaboration.
                  </p>
                  
                  <Button
                    className="mt-3 w-full"
                    onClick={handleMeet}
                    leftIcon={<Calendar size={18} />}
                  >
                    Schedule Meeting
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};