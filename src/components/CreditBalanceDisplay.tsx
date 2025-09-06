import React from 'react';
import { Coins, TrendingUp, Zap } from 'lucide-react';

interface CreditBalanceDisplayProps {
  balance: number;
  stakedAmount: number;
  variant?: 'compact' | 'detailed';
}

export const CreditBalanceDisplay: React.FC<CreditBalanceDisplayProps> = ({ 
  balance, 
  stakedAmount, 
  variant = 'compact' 
}) => {
  if (variant === 'compact') {
    return (
      <div className="glass-effect rounded-lg px-4 py-2 border border-white/10">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">{balance} Credits</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-500 rounded-lg">
          <Coins className="w-6 h-6 text-black" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Credit Balance</h3>
          <p className="text-sm text-gray-400">Available for agent launches</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Available</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{balance}</div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Staked</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{stakedAmount}</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-gray-400">
          Staking earns 2x credit efficiency
        </div>
      </div>
    </div>
  );
};