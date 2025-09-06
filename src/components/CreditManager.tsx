import React, { useState } from 'react';
import { ArrowLeft, Coins, TrendingUp, DollarSign, Zap, History } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { LoadingSpinner } from './LoadingSpinner';
import { useUser } from '../contexts/UserContext';
import { usePaymentContext } from '../hooks/usePaymentContext';

interface CreditManagerProps {
  onBack: () => void;
}

interface Transaction {
  id: string;
  type: 'stake' | 'purchase' | 'spend' | 'earn';
  amount: number;
  description: string;
  timestamp: string;
}

export const CreditManager: React.FC<CreditManagerProps> = ({ onBack }) => {
  const { user, updateUser } = useUser();
  const { createSession } = usePaymentContext();
  const [isStaking, setIsStaking] = useState(false);
  const [isPurchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');

  // Mock transaction history
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'stake',
      amount: 50,
      description: 'Staked $20 for credits',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'spend',
      amount: -10,
      description: 'Agent launch: Content Creator AI',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      type: 'earn',
      amount: 15,
      description: 'Bounty completion reward',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const handleStake = async (amount: number) => {
    if (!user) return;

    setIsStaking(true);
    try {
      await createSession({ 
        amount: `$${amount}.00`, 
        description: `Stake $${amount} for credits` 
      });
      
      const creditsEarned = amount * 2.5; // 2.5 credits per dollar staked
      updateUser({
        creditBalance: user.creditBalance + creditsEarned,
        stakedAmount: user.stakedAmount + amount
      });
    } catch (error) {
      console.error('Staking failed:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const handlePurchase = async (credits: number, cost: number) => {
    if (!user) return;

    setPurchasing(true);
    try {
      await createSession({ 
        amount: `$${cost}.00`, 
        description: `Purchase ${credits} credits` 
      });
      
      updateUser({
        creditBalance: user.creditBalance + credits
      });
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'stake': return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'purchase': return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'spend': return <Zap className="w-4 h-4 text-red-400" />;
      case 'earn': return <Coins className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Coins className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
        <p className="text-gray-300">Connect your wallet to manage credits and staking</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Credit Management</h1>
          <p className="text-gray-300 mt-1">Manage your credits, staking, and transaction history</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'overview' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'transactions' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Balance Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Current Balance</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <span className="text-lg font-medium">Available Credits</span>
                  </div>
                  <div className="text-4xl font-bold text-yellow-400">{user.creditBalance}</div>
                  <div className="text-sm text-gray-400">Ready to use</div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <span className="text-lg font-medium">Staked Amount</span>
                  </div>
                  <div className="text-4xl font-bold text-purple-400">${user.stakedAmount}</div>
                  <div className="text-sm text-gray-400">Earning 2x efficiency</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">Staking Benefits</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 2x credit efficiency for agent launches</li>
                  <li>• Priority access to premium bounties</li>
                  <li>• Reduced transaction fees</li>
                </ul>
              </div>
            </div>

            {/* Purchase Credits */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Purchase Credits</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-400/50 transition-colors">
                  <div className="text-2xl font-bold text-center mb-2">25</div>
                  <div className="text-sm text-gray-400 text-center mb-4">Credits</div>
                  <PrimaryButton
                    onClick={() => handlePurchase(25, 10)}
                    disabled={isPurchasing}
                    className="w-full"
                    variant="secondary"
                  >
                    {isPurchasing ? <LoadingSpinner size="sm" /> : '$10'}
                  </PrimaryButton>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-purple-400/50 relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-xs px-2 py-1 rounded">
                    Popular
                  </div>
                  <div className="text-2xl font-bold text-center mb-2">60</div>
                  <div className="text-sm text-gray-400 text-center mb-4">Credits</div>
                  <PrimaryButton
                    onClick={() => handlePurchase(60, 20)}
                    disabled={isPurchasing}
                    className="w-full"
                  >
                    {isPurchasing ? <LoadingSpinner size="sm" /> : '$20'}
                  </PrimaryButton>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-400/50 transition-colors">
                  <div className="text-2xl font-bold text-center mb-2">150</div>
                  <div className="text-sm text-gray-400 text-center mb-4">Credits</div>
                  <PrimaryButton
                    onClick={() => handlePurchase(150, 40)}
                    disabled={isPurchasing}
                    className="w-full"
                    variant="secondary"
                  >
                    {isPurchasing ? <LoadingSpinner size="sm" /> : '$40'}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>

          {/* Staking Options */}
          <div className="space-y-6">
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Staking Options</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/30">
                  <div className="text-lg font-semibold mb-2">Stake $20</div>
                  <div className="text-sm text-gray-300 mb-4">
                    Receive 50 credits + 2x efficiency bonus
                  </div>
                  <PrimaryButton
                    onClick={() => handleStake(20)}
                    disabled={isStaking}
                    className="w-full"
                  >
                    {isStaking ? <LoadingSpinner size="sm" /> : 'Stake $20'}
                  </PrimaryButton>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/30">
                  <div className="text-lg font-semibold mb-2">Stake $50</div>
                  <div className="text-sm text-gray-300 mb-4">
                    Receive 125 credits + premium benefits
                  </div>
                  <PrimaryButton
                    onClick={() => handleStake(50)}
                    disabled={isStaking}
                    className="w-full"
                    variant="secondary"
                  >
                    {isStaking ? <LoadingSpinner size="sm" /> : 'Stake $50'}
                  </PrimaryButton>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg border border-green-500/30">
                  <div className="text-lg font-semibold mb-2">Stake $100</div>
                  <div className="text-sm text-gray-300 mb-4">
                    Receive 250 credits + VIP status
                  </div>
                  <PrimaryButton
                    onClick={() => handleStake(100)}
                    disabled={isStaking}
                    className="w-full"
                    variant="secondary"
                  >
                    {isStaking ? <LoadingSpinner size="sm" /> : 'Stake $100'}
                  </PrimaryButton>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Credits Used Today</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg. Cost per Agent</span>
                  <span className="font-medium">8 credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Monthly Usage</span>
                  <span className="font-medium">240 credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold">Transaction History</h2>
          </div>
          
          <div className="space-y-4">
            {transactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};