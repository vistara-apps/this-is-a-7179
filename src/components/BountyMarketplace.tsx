import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, TrendingUp } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { TextInput } from './TextInput';
import { BountyCard } from './BountyCard';
import { useUser } from '../contexts/UserContext';

interface BountyMarketplaceProps {
  onBack: () => void;
}

export const BountyMarketplace: React.FC<BountyMarketplaceProps> = ({ onBack }) => {
  const { bounties, addBounty } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'inProgress' | 'closed'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardAmount: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateBounty = () => {
    if (!formData.title || !formData.description || !formData.rewardAmount) return;

    addBounty({
      title: formData.title,
      description: formData.description,
      rewardAmount: parseFloat(formData.rewardAmount),
      status: 'open'
    });

    // Reset form
    setFormData({ title: '', description: '', rewardAmount: '' });
    setShowCreateForm(false);
  };

  const filteredBounties = bounties.filter(bounty => {
    const matchesSearch = bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bounty.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || bounty.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Bounty Marketplace</h1>
          <p className="text-gray-300 mt-1">Find bounties to complete with your agents or create new ones</p>
        </div>
        <PrimaryButton 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Bounty
        </PrimaryButton>
      </div>

      {/* Create Bounty Form */}
      {showCreateForm && (
        <div className="glass-effect rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-6">Create New Bounty</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TextInput
                label="Bounty Title"
                placeholder="e.g., Create Twitter Thread About DeFi"
                value={formData.title}
                onChange={(value) => handleInputChange('title', value)}
                required
              />
              
              <TextInput
                label="Reward Amount ($)"
                placeholder="25"
                value={formData.rewardAmount}
                onChange={(value) => handleInputChange('rewardAmount', value)}
                required
              />
            </div>
            
            <div>
              <TextInput
                label="Description"
                placeholder="Describe the task requirements, deliverables, and success criteria..."
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                variant="area"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <PrimaryButton
              onClick={handleCreateBounty}
              disabled={!formData.title || !formData.description || !formData.rewardAmount}
            >
              Create Bounty
            </PrimaryButton>
            <PrimaryButton
              onClick={() => setShowCreateForm(false)}
              variant="secondary"
            >
              Cancel
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bounties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="inProgress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-effect rounded-lg p-4 border border-white/10">
          <div className="text-2xl font-bold text-purple-400">{bounties.length}</div>
          <div className="text-sm text-gray-400">Total Bounties</div>
        </div>
        <div className="glass-effect rounded-lg p-4 border border-white/10">
          <div className="text-2xl font-bold text-green-400">{bounties.filter(b => b.status === 'open').length}</div>
          <div className="text-sm text-gray-400">Open</div>
        </div>
        <div className="glass-effect rounded-lg p-4 border border-white/10">
          <div className="text-2xl font-bold text-yellow-400">{bounties.filter(b => b.status === 'inProgress').length}</div>
          <div className="text-sm text-gray-400">In Progress</div>
        </div>
        <div className="glass-effect rounded-lg p-4 border border-white/10">
          <div className="text-2xl font-bold text-blue-400">${bounties.reduce((sum, b) => sum + b.rewardAmount, 0)}</div>
          <div className="text-sm text-gray-400">Total Value</div>
        </div>
      </div>

      {/* Bounty Grid */}
      {filteredBounties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBounties.map(bounty => (
            <BountyCard 
              key={bounty.bountyId} 
              bounty={bounty}
              showClaimAction={bounty.status === 'open'}
            />
          ))}
        </div>
      ) : (
        <div className="glass-effect rounded-xl p-12 text-center border border-white/10">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No bounties found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Be the first to create a bounty!'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <PrimaryButton onClick={() => setShowCreateForm(true)}>
              Create First Bounty
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
};