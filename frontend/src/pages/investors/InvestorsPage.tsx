import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { apiGet } from '../../utils/api';

export const InvestorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const data = await apiGet<any[]>('/profile', token);
        const filtered = data.filter((p: any) => {
          const isInvestor = p.user?.role === 'investor';
          const isNotSelf = p.user?._id !== user?.id && p.user?.id !== user?.id;
          return isInvestor && isNotSelf;
        });
        setInvestors(filtered);
      } catch (e) {
        console.error("Failed to fetch investors", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestors();
  }, [token, user?.id]);
  
  // Basic search filter over names and bio
  const filteredInvestors = investors.filter(investor => {
    return searchQuery === '' || 
      (investor.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (investor.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Investors</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect with real investors actively looking for startups.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar (simplified for active data structure) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Search Directory</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You are currently viewing all registered Investors on the Nexus platform. Real-time property filters are arriving soon!
              </p>
            </CardBody>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search investors by name or keywords in bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded px-2 py-1 bg-white dark:bg-gray-800">
                {filteredInvestors.length} Active Results
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInvestors.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-8">No investors found matching your search.</p>
            ) : (
              filteredInvestors.map(investor => (
                <InvestorCard
                  key={investor._id}
                  investor={investor}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};