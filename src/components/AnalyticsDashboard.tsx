import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { analyticsService, PerformanceMetrics, MarketInsights } from '../services/analytics';
import { creditService } from '../services/supabase';
import { PrimaryButton } from './PrimaryButton';
import { LoadingSpinner } from './LoadingSpinner';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target,
  Lightbulb,
  Calendar,
  DollarSign,
  Activity,
  Users,
  Award,
  AlertCircle
} from 'lucide-react';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack }) => {
  const { user, agents, bounties } = useUser();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [user, agents, bounties, selectedTimeframe]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load user transactions
      const userTransactions = await creditService.getUserTransactions(user.userId);
      setTransactions(userTransactions);

      // Get performance metrics
      const metrics = await analyticsService.getUserPerformanceMetrics(
        user.userId,
        agents,
        bounties,
        userTransactions
      );
      setPerformanceMetrics(metrics);

      // Get market insights
      const insights = await analyticsService.getMarketInsights();
      setMarketInsights(insights);

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateROI = () => {
    if (!user || transactions.length === 0) return null;
    
    const creditsUsed = transactions
      .filter(t => t.type === 'spend')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return analyticsService.calculateStakingROI(
      user.stakedAmount,
      creditsUsed,
      30 // 30 days
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!performanceMetrics || !marketInsights) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-4">Analytics Unavailable</h2>
        <p className="text-gray-300 mb-6">
          Unable to load analytics data. Please try again later.
        </p>
        <PrimaryButton onClick={onBack}>
          Back to Dashboard
        </PrimaryButton>
      </div>
    );
  }

  const roi = calculateROI();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-300 mt-2">
            Comprehensive insights into your agent performance and market trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <PrimaryButton onClick={onBack} variant="secondary">
            Back to Dashboard
          </PrimaryButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">Total Agents</span>
          </div>
          <div className="text-2xl font-bold">{performanceMetrics.totalAgents}</div>
          <div className="text-sm text-green-400">
            {performanceMetrics.activeAgents} active
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">Bounties</span>
          </div>
          <div className="text-2xl font-bold">{performanceMetrics.totalBounties}</div>
          <div className="text-sm text-green-400">
            {performanceMetrics.completedBounties} completed
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-sm text-gray-400">Total Earnings</span>
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(performanceMetrics.totalEarnings)}
          </div>
          <div className="text-sm text-gray-400">
            All time
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-sm text-gray-400">Success Rate</span>
          </div>
          <div className="text-2xl font-bold">
            {performanceMetrics.averageSuccessRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">
            Average across agents
          </div>
        </div>
      </div>

      {/* ROI Analysis */}
      {roi && (
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Staking ROI Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">ROI</div>
              <div className={`text-2xl font-bold ${roi.stakingROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(roi.stakingROI)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Savings</div>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(roi.savings)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Break-even</div>
              <div className="text-2xl font-bold">
                {roi.breakEvenPoint.toFixed(0)} days
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Direct Cost</div>
              <div className="text-2xl font-bold text-gray-300">
                {formatCurrency(roi.directPaymentCost)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Task Types */}
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trending Task Types
          </h2>
          <div className="space-y-4">
            {marketInsights.trendingTaskTypes.map((task, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{task.type}</div>
                  <div className="text-sm text-gray-400">
                    {task.volume} bounties • Avg {formatCurrency(task.avgReward)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`font-semibold ${task.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(task.growth)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunity Areas */}
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Market Opportunities
          </h2>
          <div className="space-y-4">
            {marketInsights.opportunityAreas.map((opportunity, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{opportunity.taskType}</div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-semibold text-green-400">
                      {opportunity.opportunityScore}/10
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{opportunity.description}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span>Demand: {opportunity.demandScore}/10</span>
                  <span>Supply: {opportunity.supplyScore}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {performanceMetrics.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                {activity.type === 'agent_created' && <Users className="w-4 h-4 text-purple-400" />}
                {activity.type === 'bounty_completed' && <Target className="w-4 h-4 text-blue-400" />}
                {activity.type === 'credits_earned' && <DollarSign className="w-4 h-4 text-green-400" />}
                {activity.type === 'agent_optimized' && <TrendingUp className="w-4 h-4 text-yellow-400" />}
              </div>
              <div className="flex-1">
                <div className="font-medium">{activity.description}</div>
                <div className="text-sm text-gray-400">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
              {activity.value && (
                <div className="text-green-400 font-semibold">
                  +{formatCurrency(activity.value)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Agent */}
      {performanceMetrics.topPerformingAgent && (
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Performing Agent
          </h2>
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {performanceMetrics.topPerformingAgent.name}
              </h3>
              <p className="text-gray-400 mb-2">
                {performanceMetrics.topPerformingAgent.description}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Success Rate</div>
                  <div className="font-semibold text-green-400">
                    {performanceMetrics.topPerformingAgent.performanceMetrics.successRate}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Total Runs</div>
                  <div className="font-semibold">
                    {performanceMetrics.topPerformingAgent.performanceMetrics.totalRuns}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Avg Reward</div>
                  <div className="font-semibold text-blue-400">
                    {formatCurrency(performanceMetrics.topPerformingAgent.performanceMetrics.avgReward)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
