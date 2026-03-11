import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Search, PlusCircle, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth, API_URL } from '../../context/AuthContext';

export const InvestorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [balance, setBalance] = useState('0.00');
  const [loading, setLoading] = useState(true);
  
  const API = API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [profRes, meetRes, balRes] = await Promise.all([
          fetch(`${API}/profile`, { headers }),
          fetch(`${API}/meetings`, { headers }),
          fetch(`${API}/payments/balance`, { headers })
        ]);
        
        if (profRes.ok) {
          const profiles = await profRes.json();
          setEntrepreneurs(profiles.filter((p: any) => p.user?.role === 'entrepreneur'));
        }
        if (meetRes.ok) setMeetings(await meetRes.json());
        if (balRes.ok) {
          const b = await balRes.json();
          setBalance(b.balance);
        }
      } catch (e) {
        console.error("Investor dashboard fetch error", e);
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
  
  // Filter entrepreneurs based on search
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    return searchQuery === '' || 
      (entrepreneur.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entrepreneur.startupName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entrepreneur.industry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entrepreneur.bio || entrepreneur.pitchSummary || '').toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const totalConnections = meetings.filter(m => m.status === 'accepted').length;
  const industries = Array.from(new Set(entrepreneurs.map(e => e.industry || 'Tech')));
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discover Startups</h1>
          <p className="text-gray-600 dark:text-gray-400">Find and connect with promising entrepreneurs</p>
        </div>
        
        <Link to="/entrepreneurs">
          <Button
            leftIcon={<PlusCircle size={18} />}
          >
            View All Startups
          </Button>
        </Link>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-full mr-4">
                <Users size={20} className="text-primary-700 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">Total Startups</p>
                <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100">{entrepreneurs.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 dark:bg-secondary-900/10 border border-secondary-100 dark:border-secondary-900/20">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/20 rounded-full mr-4">
                <PieChart size={20} className="text-secondary-700 dark:text-secondary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Industries</p>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">{industries.length}</h3>
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
                <p className="text-sm font-medium text-accent-700 dark:text-accent-300">Connections</p>
                <h3 className="text-xl font-semibold text-accent-900 dark:text-accent-100">
                  {totalConnections}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>
      </div>
      
      {/* Entrepreneurs grid */}
      <div>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Featured Startups</h2>
          </CardHeader>
          
          <CardBody>
            {filteredEntrepreneurs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntrepreneurs.slice(0, 6).map(entrepreneur => (
                  <EntrepreneurCard
                    key={entrepreneur._id}
                    entrepreneur={entrepreneur}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No startups found matching your request.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};