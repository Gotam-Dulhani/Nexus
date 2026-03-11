import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, DollarSign, PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth, API_URL } from '../../context/AuthContext';

export const EntrepreneurDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState<any[]>([]);
  const [balance, setBalance] = useState('0.00');
  const [loading, setLoading] = useState(true);
  
  const API = API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [meetRes, profRes, balRes] = await Promise.all([
          fetch(`${API}/meetings`, { headers }),
          fetch(`${API}/profile`, { headers }),
          fetch(`${API}/payments/balance`, { headers })
        ]);
        
        if (meetRes.ok) setMeetings(await meetRes.json());
        if (profRes.ok) {
          const profiles = await profRes.json();
          setRecommendedInvestors(profiles.filter((p: any) => p.user?.role === 'investor').slice(0, 3));
        }
        if (balRes.ok) {
          const b = await balRes.json();
          setBalance(b.balance);
        }
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token, API]);
  
  if (!user || loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
  
  const pendingMeetings = meetings.filter(m => m.status === 'pending' && m.attendee?._id === user.id);
  const totalAccepted = meetings.filter(m => m.status === 'accepted').length;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">Here's a live overview of your Nexus activity.</p>
        </div>
        
        <Link to="/investors">
          <Button
            leftIcon={<PlusCircle size={18} />}
          >
            Find Investors
          </Button>
        </Link>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-full mr-4">
                <Bell size={20} className="text-primary-700 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">Meeting Invites</p>
                <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100">{pendingMeetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 dark:bg-secondary-900/10 border border-secondary-100 dark:border-secondary-900/20">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/20 rounded-full mr-4">
                <Users size={20} className="text-secondary-700 dark:text-secondary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Connections</p>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                  {totalAccepted}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-success-50 dark:bg-success-900/10 border border-success-100 dark:border-success-900/20">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-success-900/20 rounded-full mr-4">
                <DollarSign size={20} className="text-success-700 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700 dark:text-success-300">Wallet Balance</p>
                <h3 className="text-xl font-semibold text-success-900 dark:text-success-100">${balance}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 dark:bg-accent-900/10 border border-accent-100 dark:border-accent-900/20">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 dark:bg-accent-900/20 rounded-full mr-4">
                <Calendar size={20} className="text-accent-700 dark:text-accent-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700 dark:text-accent-300">Total Events</p>
                <h3 className="text-xl font-semibold text-accent-900 dark:text-accent-100">{meetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting requests */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pending Meetings</h2>
              <Badge variant="warning">{pendingMeetings.length} pending</Badge>
            </CardHeader>
            
            <CardBody>
              {pendingMeetings.length > 0 ? (
                <div className="space-y-4">
                  {pendingMeetings.map(m => (
                    <div key={m._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{m.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">From: {m.host?.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(m.startTime).toLocaleString()}</p>
                      </div>
                      <Link to="/meetings">
                        <Button size="sm" variant="outline">Manage</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Calendar size={24} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">No pending meeting requests</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Investors will show up here once they schedule a call.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        {/* Recommended investors */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Investors</h2>
              <Link to="/investors" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </CardHeader>
            
            <CardBody className="space-y-4">
              {recommendedInvestors.length > 0 ? (
                recommendedInvestors.map(investor => (
                  <InvestorCard
                    key={investor._id}
                    investor={investor}
                    showActions={false}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No investors available for recommendation yet.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};