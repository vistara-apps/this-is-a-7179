import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bot, TrendingUp, Coins, Activity } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'dashboard' | 'launch' | 'marketplace' | 'credits') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="border-b border-white/10 glass-effect">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">AgentBloom</h1>
              <p className="text-sm text-gray-300">Cultivate Your On-Chain Agent Economy</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Activity className="w-4 h-4 inline-block mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('launch')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'launch' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bot className="w-4 h-4 inline-block mr-2" />
              Launch Agent
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'marketplace' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline-block mr-2" />
              Marketplace
            </button>
            <button
              onClick={() => onNavigate('credits')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'credits' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Coins className="w-4 h-4 inline-block mr-2" />
              Credits
            </button>
          </nav>
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};