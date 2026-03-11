import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard, Plus, Check } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth, API_URL } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, token, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Appearance state
  const [theme, setTheme] = useState(localStorage.getItem('nexus_theme') || 'Light');
  
  // Billing state
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [paymentMethods] = useState([
    { id: '1', type: 'Visa', last4: '4242', exp: '12/28', isDefault: true }
  ]);
  const [newCard, setNewCard] = useState({ number: '', exp: '', cvc: '' });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || 'San Francisco, CA'
  });

  // Handle theme change on mount and when theme changes
  useEffect(() => {
    if (theme === 'Dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'Light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleProfileUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`${API_URL}/profile/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('Failed to parse response as JSON:', text);
        setMessage({ type: 'error', text: `Response error: ${text.substring(0, 1000)}` });
        setLoading(false);
        return;
      }
      
      if (res.ok) {
        // Update user context with new avatar
        if (user) {
          setUser({ ...user, avatarUrl: data.avatarUrl });
        }
        setMessage({ type: 'success', text: 'Photo updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to upload photo' });
      }
    } catch (e: any) {
      console.error('Upload error details:', e);
      let errorMsg = 'Server error';
      if (e instanceof TypeError && e.message.includes('fetch')) {
        errorMsg = 'Network error: Backend might be unreachable';
      } else if (e.name === 'SyntaxError') {
        errorMsg = 'Response error: Server did not return valid JSON';
      } else if (e.message) {
        errorMsg = `Error: ${e.message}`;
      }
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'language', icon: Globe, label: 'Language' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'billing', icon: CreditCard, label: 'Billing' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Manage your account preferences and settings</p>
        <button 
          onClick={async () => {
            try {
              const res = await fetch(`${API_URL}/ping-test`, { method: 'POST' });
              const data = await res.json();
              alert(`Ping Response: ${JSON.stringify(data)}`);
            } catch (e: any) {
              alert(`Ping Failed: ${e.message}`);
            }
          }}
          className="text-[8px] text-gray-300 hover:text-gray-900"
        >
          Check API Connectivity
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200'
                  }`}
                >
                  <tab.icon size={18} className="mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>
        
        {/* Main settings content */}
        <div className="lg:col-span-3 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar
                    src={user.avatarUrl || ''}
                    alt={user.name}
                    size="xl"
                  />
                  
                  <div>
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload}
                      accept="image/png, image/jpeg, image/gif"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                    >
                      {loading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      JPG, GIF or PNG. Max size of 5MB
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={user.email}
                    disabled
                  />
                  
                  <Input
                    label="Role"
                    value={user.role}
                    disabled
                  />
                  
                  <Input
                    label="Location"
                    value={profileForm.location}
                    onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                    rows={4}
                    value={profileForm.bio}
                    onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setProfileForm({ name: user.name, bio: user.bio || '', location: 'San Francisco, CA' })}>Reset</Button>
                  <Button onClick={handleProfileUpdate} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Security Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between border dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add an extra layer of security to your account.
                      </p>
                      <Badge variant="error" className="mt-1">Not Enabled</Badge>
                    </div>
                    <Button variant="outline" onClick={() => setMessage({ type: 'success', text: 'Two-Factor Authentication setup instructions sent to your email.' })}>Enable</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                    <div className="flex justify-start">
                      <Button onClick={() => setMessage({ type: 'success', text: 'Password updated successfully.' })}>Update Password</Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Notification Preferences</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="space-y-4">
                  {[
                    { title: 'Email Notifications', desc: 'Receive updates via email about your activity.' },
                    { title: 'Meeting Reminders', desc: 'Get notified 15 minutes before a scheduled meeting.' },
                    { title: 'New Message Alerts', desc: 'Notify when you receive a new chat message.' },
                    { title: 'Investment Alerts', desc: 'Receive alerts about new matching startups or investors.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id={`toggle-${idx}`} defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-primary-600"/>
                        <label htmlFor={`toggle-${idx}`} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setMessage({ type: 'success', text: 'Notification settings saved.' })}>Save Preferences</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'language' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Language & Region</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="max-w-md space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Language</label>
                    <select className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 transition-colors duration-300">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Zone</label>
                    <select className="w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      <option>(GMT-08:00) Pacific Time</option>
                      <option>(GMT-05:00) Eastern Time</option>
                      <option>(GMT+00:00) UTC</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setMessage({ type: 'success', text: 'Regional settings updated.' })}>Save Settings</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Appearance Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Theme Preference</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Light', 'Dark', 'System'].map((t) => (
                      <div 
                        key={t} 
                        onClick={() => setTheme(t)}
                        className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                          theme === t 
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className={`h-12 w-full rounded mb-2 ${
                          t === 'Dark' ? 'bg-gray-800' : 
                          t === 'Light' ? 'bg-white border border-gray-200' : 
                          'bg-gradient-to-r from-white to-gray-800 border border-gray-200'
                        }`}></div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-medium dark:text-gray-200">{t}</span>
                          {theme === t && <Check size={14} className="text-primary-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setMessage({ type: 'success', text: `Theme updated to ${theme}.` })}>Apply Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Billing & Subscription</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="border border-primary-200 bg-primary-50 dark:bg-primary-900/10 dark:border-primary-900/30 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-primary-900 dark:text-primary-400">Premium Plan</h4>
                    <p className="text-sm text-primary-700 dark:text-primary-500">Your next billing date is April 10, 2026</p>
                  </div>
                  <Badge variant="primary">Active</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Payment Methods</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingBilling(!isEditingBilling)}>
                      {isEditingBilling ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>

                  {isEditingBilling ? (
                    <div className="space-y-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                      <Input 
                        label="Card Number" 
                        placeholder="0000 0000 0000 0000" 
                        value={newCard.number}
                        onChange={(e) => setNewCard({...newCard, number: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          label="Expiry Date" 
                          placeholder="MM/YY" 
                          value={newCard.exp}
                          onChange={(e) => setNewCard({...newCard, exp: e.target.value})}
                        />
                        <Input 
                          label="CVC" 
                          placeholder="123" 
                          value={newCard.cvc}
                          onChange={(e) => setNewCard({...newCard, cvc: e.target.value})}
                        />
                      </div>
                      <Button fullWidth onClick={() => {
                        setIsEditingBilling(false);
                        setMessage({ type: 'success', text: 'Payment method updated successfully.' });
                      }}>Update Card</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map(pm => (
                        <div key={pm.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mr-3">
                              <CreditCard size={20} className="text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{pm.type} ending in {pm.last4}</p>
                              <p className="text-xs text-gray-500">Expires {pm.exp} {pm.isDefault && <span className="text-primary-600 ml-2">(Default)</span>}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" fullWidth className="border-dashed">
                        <Plus size={16} className="mr-2" /> Add New Payment Method
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-900/30">Cancel Subscription</Button>
                </div>
              </CardBody>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};