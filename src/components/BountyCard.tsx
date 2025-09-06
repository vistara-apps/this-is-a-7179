import React from 'react';
import { TrendingUp, Clock, CheckCircle, DollarSign, User } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { useUser } from '../contexts/UserContext';

interface Bounty {
  bountyId: string;
  creatorId: string;
  title: string;
  description: string;
  rewardAmount: number;
  status: 'open' | 'inProgress' | 'closed';
  assignedAgentId?: string;
  createdAt: string;
}

interface BountyCardProps {
  bounty: Bounty;
  variant?: 'open' | 'inProgress' | 'closed';
  showClaimAction?: boolean;
}

export const BountyCard: React.FC<BountyCardProps> = ({ 
  bounty, 
  variant = bounty.status,
  showClaimAction = false 
}) => {
  const { agents, updateBounty } = useUser();

  const getStatusColor = () => {
    switch (variant) {
      case 'open': return 'text-green-400 bg-green-400/10';
      case 'inProgress': return 'text-yellow-400 bg-yellow-400/10';
      case 'closed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = () => {
    switch (variant) {
      case 'open': return <TrendingUp className="w-4 h-4" />;
      case 'inProgress': return <Clock className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const handleClaimBounty = () => {
    if (agents.length > 0) {
      // Assign to first available agent
      updateBounty(bounty.bountyId, {
        status: 'inProgress',
        assignedAgentId: agents[0].agentId
      });
    }
  };

  const assignedAgent = bounty.assignedAgentId ? 
    agents.find(a => a.agentId === bounty.assignedAgentId) : null;

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 card-glow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{bounty.title}</h3>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
            {getStatusIcon()}
            {variant}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-400 font-bold">
            <DollarSign className="w-4 h-4" />
            {bounty.rewardAmount}
          </div>
          <div className="text-xs text-gray-400">Reward</div>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{bounty.description}</p>

      {assignedAgent && (
        <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400">Assigned to: {assignedAgent.name}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>Created {new Date(bounty.createdAt).toLocaleDateString()}</span>
        <span>ID: {bounty.bountyId.slice(-6)}</span>
      </div>

      {showClaimAction && variant === 'open' && (
        <PrimaryButton 
          onClick={handleClaimBounty}
          className="w-full"
          disabled={agents.length === 0}
        >
          {agents.length > 0 ? 'Claim with Agent' : 'No Agents Available'}
        </PrimaryButton>
      )}

      {variant === 'inProgress' && assignedAgent && (
        <div className="text-center">
          <div className="text-sm text-yellow-400 mb-2">🤖 Agent is working...</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-400 h-2 rounded-full w-2/3 animate-pulse"></div>
          </div>
        </div>
      )}

      {variant === 'closed' && (
        <div className="text-center text-green-400 text-sm">
          ✅ Completed successfully
        </div>
      )}
    </div>
  );
};