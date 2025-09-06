import React from 'react';
import { useUser } from '../contexts/UserContext';
import { AgentCard } from './AgentCard';
import { BountyCard } from './BountyCard';
import { CreditBalanceDisplay } from './CreditBalanceDisplay';
import { PrimaryButton } from './PrimaryButton';
import { Bot, TrendingUp, Coins, Plus, Activity } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'launch' | 'marketplace' | 'credits') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, agents, bounties } = useUser();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="glass-effect rounded-2xl p-8 card-glow">
          <Bot className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 className="text-3xl font-bold mb-4">Welcome to AgentBloom</h2>
          <p className="text-gray-300 mb-6">
            Connect your wallet to start launching AI agents and managing bounties on Base.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <Bot className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-semibold mb-2">Launch AI Agents</h3>
              <p className="text-sm text-gray-400">Deploy intelligent agents to complete on-chain tasks</p>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-semibold mb-2">Bounty Marketplace</h3>
              <p className="text-sm text-gray-400">Earn rewards by completing bounties with your agents</p>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <Coins className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="font-semibold mb-2">Stake & Earn</h3>
              <p className="text-sm text-gray-400">Stake tokens for credits and better rates</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userBounties = bounties.filter(b => b.creatorId === user.userId);
  const availableBounties = bounties.filter(b => b.creatorId !== user.userId && b.status === 'open');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Credit Balance */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Agent Dashboard</h1>
          <p className="text-gray-300 mt-2">Manage your AI agents and track bounty performance</p>
        </div>
        <CreditBalanceDisplay 
          balance={user.creditBalance} 
          stakedAmount={user.stakedAmount}
          variant="detailed"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PrimaryButton 
          onClick={() => onNavigate('launch')}
          className="flex items-center gap-2 p-4"
        >
          <Plus className="w-5 h-5" />
          Launch Agent
        </PrimaryButton>
        <PrimaryButton 
          onClick={() => onNavigate('marketplace')}
          variant="secondary"
          className="flex items-center gap-2 p-4"
        >
          <TrendingUp className="w-5 h-5" />
          Browse Bounties
        </PrimaryButton>
        <PrimaryButton 
          onClick={() => onNavigate('credits')}
          variant="secondary"
          className="flex items-center gap-2 p-4"
        >
          <Coins className="w-5 h-5" />
          Manage Credits
        </PrimaryButton>
        <div className="glass-effect rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Activity className="w-4 h-4" />
            Total Earnings: ${agents.reduce((sum, agent) => sum + (agent.performanceMetrics.avgReward * agent.performanceMetrics.totalRuns), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* My Agents */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Agents</h2>
          <span className="text-sm text-gray-400">{agents.length} active</span>
        </div>
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
              <AgentCard key={agent.agentId} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-xl p-8 text-center border border-white/10">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300 mb-4">No agents deployed yet</p>
            <PrimaryButton onClick={() => onNavigate('launch')}>
              Launch Your First Agent
            </PrimaryButton>
          </div>
        )}
      </section>

      {/* My Bounties */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Bounties</h2>
          <span className="text-sm text-gray-400">{userBounties.length} created</span>
        </div>
        {userBounties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBounties.map(bounty => (
              <BountyCard key={bounty.bountyId} bounty={bounty} />
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-xl p-8 text-center border border-white/10">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300 mb-4">No bounties created yet</p>
            <PrimaryButton onClick={() => onNavigate('marketplace')}>
              Create Your First Bounty
            </PrimaryButton>
          </div>
        )}
      </section>

      {/* Available Bounties */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Available Bounties</h2>
          <span className="text-sm text-gray-400">{availableBounties.length} open</span>
        </div>
        {availableBounties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBounties.slice(0, 6).map(bounty => (
              <BountyCard key={bounty.bountyId} bounty={bounty} showClaimAction />
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-xl p-8 text-center border border-white/10">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300">No bounties available at the moment</p>
          </div>
        )}
      </section>
    </div>
  );
};