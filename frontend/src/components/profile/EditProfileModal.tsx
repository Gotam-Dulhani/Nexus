import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any;
  onSave: (data: any) => Promise<void>;
  role: 'entrepreneur' | 'investor';
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen, onClose, initialData, onSave, role
}) => {
  const [formData, setFormData] = useState({
    bio: initialData.bio || '',
    location: initialData.location || '',
    avatar: null as File | null,
    // Entrepreneur specific
    startupName: initialData.startupName || '',
    industry: initialData.industry || '',
    pitchSummary: initialData.pitchSummary || '',
    // Investor specific
    minimumInvestment: initialData.minimumInvestment || '',
    maximumInvestment: initialData.maximumInvestment || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.bio.trim()) {
      setError('Bio is required');
      return;
    }
    if (role === 'entrepreneur' && !formData.startupName.trim()) {
      setError('Startup name is required for entrepreneurs');
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio / About Me</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            {role === 'entrepreneur' && (
               <>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startup Name</label>
                   <input
                     type="text"
                     name="startupName"
                     value={formData.startupName}
                     onChange={handleChange}
                     className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                   <input
                     type="text"
                     name="industry"
                     value={formData.industry}
                     onChange={handleChange}
                     className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                   />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pitch Summary</label>
                   <textarea
                     name="pitchSummary"
                     value={formData.pitchSummary}
                     onChange={handleChange}
                     rows={3}
                     className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                   />
                 </div>
               </>
            )}

            {role === 'investor' && (
               <>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Investment (e.g. $50K)</label>
                   <input
                     type="text"
                     name="minimumInvestment"
                     value={formData.minimumInvestment}
                     onChange={handleChange}
                     className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Investment (e.g. $1M)</label>
                   <input
                     type="text"
                     name="maximumInvestment"
                     value={formData.maximumInvestment}
                     onChange={handleChange}
                     className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                   />
                 </div>
               </>
            )}

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
