import React from 'react';
import { Bot, TrendingUp, Zap, Clock } from 'lucide-react';

interface Agent {
  agentId: string;
  userId: string;
  name: string;
  description: string;
  promptTemplate: string;
  performanceMetrics: {
    successRate: number;
    totalRuns: number;
    avgReward: number;
  };
  status: 'active' | 'completed' | 'failed';
  createdAt: string;
}

interface AgentCardProps {
  agent: Agent;
  variant?: 'active' | 'completed' | 'failed';
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, variant = agent.status }) => {
  const getStatusColor = () => {
    switch (variant) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-blue-400 bg-blue-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = () => {
    switch (variant) {
      case 'active': return <Zap className="w-4 h-4" />;
      case 'completed': return <TrendingUp className="w-4 h-4" />;
      case 'failed': return <Clock className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 card-glow group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
              {getStatusIcon()}
              {variant}
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{agent.description}</p>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">{agent.performanceMetrics.successRate}%</div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">{agent.performanceMetrics.totalRuns}</div>
          <div className="text-xs text-gray-400">Total Runs</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-400">${agent.performanceMetrics.avgReward}</div>
          <div className="text-xs text-gray-400">Avg Reward</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Created {new Date(agent.createdAt).toLocaleDateString()}</span>
        <span>ID: {agent.agentId.slice(-6)}</span>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-gray-400 mb-2">Prompt Template:</div>
        <div className="text-xs bg-black/20 rounded p-2 font-mono">
          {agent.promptTemplate.slice(0, 50)}...
        </div>
      </div>
    </div>
  );
};