import React, { useState } from 'react';
import { X, DollarSign, Building2, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CardBody } from '../ui/Card';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (deal: any) => void;
}

export const AddDealModal: React.FC<AddDealModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    startupName: '',
    industry: '',
    amount: '',
    equity: '',
    stage: 'Seed',
    status: 'Due Diligence'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount.replace(/[^0-9.]/g, '')),
      equity: parseFloat(formData.equity.replace(/[^0-9.]/g, ''))
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Investment Deal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Startup Name"
            placeholder="e.g. Acme AI"
            value={formData.startupName}
            onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
            startAdornment={<Building2 size={18} />}
            required
            fullWidth
          />

          <Input
            label="Industry"
            placeholder="e.g. FinTech, SaaS"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Investment Amount"
              placeholder="e.g. 500000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              startAdornment={<DollarSign size={18} />}
              required
              fullWidth
            />
            <Input
              label="Equity (%)"
              placeholder="e.g. 10"
              value={formData.equity}
              onChange={(e) => setFormData({ ...formData, equity: e.target.value })}
              required
              fullWidth
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Stage</label>
              <select
                className="w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              >
                <option>Pre-seed</option>
                <option>Seed</option>
                <option>Series A</option>
                <option>Series B</option>
                <option>Series C</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pipeline Status</label>
              <select
                className="w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option>Due Diligence</option>
                <option>Term Sheet</option>
                <option>Negotiation</option>
                <option>Closed</option>
                <option>Passed</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit">Add Deal</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
