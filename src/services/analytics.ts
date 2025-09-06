import { Agent, Bounty, CreditTransaction } from './supabase';

interface PerformanceMetrics {
  totalAgents: number;
  activeAgents: number;
  totalBounties: number;
  completedBounties: number;
  totalEarnings: number;
  averageSuccessRate: number;
  topPerformingAgent: Agent | null;
  recentActivity: ActivityEvent[];
}

interface ActivityEvent {
  id: string;
  type: 'agent_created' | 'bounty_completed' | 'credits_earned' | 'agent_optimized';
  timestamp: string;
  description: string;
  value?: number;
  agentId?: string;
  bountyId?: string;
}

interface AgentAnalytics {
  agent: Agent;
  performanceTrend: PerformanceTrendPoint[];
  earningsHistory: EarningsPoint[];
  taskTypeDistribution: TaskTypeStats[];
  competitorComparison: CompetitorStats[];
  optimizationSuggestions: OptimizationSuggestion[];
}

interface PerformanceTrendPoint {
  date: string;
  successRate: number;
  totalRuns: number;
  avgReward: number;
}

interface EarningsPoint {
  date: string;
  amount: number;
  bountyCount: number;
}

interface TaskTypeStats {
  type: string;
  count: number;
  successRate: number;
  avgReward: number;
}

interface CompetitorStats {
  agentName: string;
  successRate: number;
  avgReward: number;
  totalRuns: number;
}

interface OptimizationSuggestion {
  type: 'prompt' | 'pricing' | 'targeting' | 'timing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'easy' | 'medium' | 'hard';
}

interface MarketInsights {
  trendingTaskTypes: TaskTypeTrend[];
  averageRewards: RewardTrend[];
  competitionLevel: CompetitionLevel[];
  opportunityAreas: OpportunityArea[];
  seasonalPatterns: SeasonalPattern[];
}

interface TaskTypeTrend {
  type: string;
  growth: number; // percentage
  volume: number;
  avgReward: number;
}

interface RewardTrend {
  taskType: string;
  currentAvg: number;
  previousAvg: number;
  change: number;
}

interface CompetitionLevel {
  taskType: string;
  agentCount: number;
  competitionScore: number; // 1-10
}

interface OpportunityArea {
  taskType: string;
  demandScore: number;
  supplyScore: number;
  opportunityScore: number;
  description: string;
}

interface SeasonalPattern {
  taskType: string;
  pattern: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
  confidence: number;
  description: string;
}

class AnalyticsService {
  /**
   * Get comprehensive performance metrics for a user
   */
  async getUserPerformanceMetrics(
    userId: string,
    agents: Agent[],
    bounties: Bounty[],
    transactions: CreditTransaction[]
  ): Promise<PerformanceMetrics> {
    const userBounties = bounties.filter(b => b.creatorId === userId);
    const completedBounties = userBounties.filter(b => b.status === 'closed');
    
    const totalEarnings = transactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.amount, 0);

    const averageSuccessRate = agents.length > 0
      ? agents.reduce((sum, a) => sum + a.performanceMetrics.successRate, 0) / agents.length
      : 0;

    const topPerformingAgent = agents.length > 0
      ? agents.reduce((best, current) => 
          current.performanceMetrics.successRate > best.performanceMetrics.successRate 
            ? current 
            : best
        )
      : null;

    const recentActivity = this.generateRecentActivity(agents, bounties, transactions);

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      totalBounties: userBounties.length,
      completedBounties: completedBounties.length,
      totalEarnings,
      averageSuccessRate,
      topPerformingAgent,
      recentActivity: recentActivity.slice(0, 10), // Last 10 activities
    };
  }

  /**
   * Get detailed analytics for a specific agent
   */
  async getAgentAnalytics(
    agent: Agent,
    historicalData?: any[]
  ): Promise<AgentAnalytics> {
    // Generate performance trend (mock data for now)
    const performanceTrend = this.generatePerformanceTrend(agent);
    
    // Generate earnings history
    const earningsHistory = this.generateEarningsHistory(agent);
    
    // Analyze task type distribution
    const taskTypeDistribution = this.analyzeTaskTypes(agent);
    
    // Compare with competitors
    const competitorComparison = await this.getCompetitorComparison(agent);
    
    // Generate optimization suggestions
    const optimizationSuggestions = this.generateOptimizationSuggestions(agent);

    return {
      agent,
      performanceTrend,
      earningsHistory,
      taskTypeDistribution,
      competitorComparison,
      optimizationSuggestions,
    };
  }

  /**
   * Get market insights and trends
   */
  async getMarketInsights(): Promise<MarketInsights> {
    // This would typically query aggregated data from the database
    // For now, we'll return mock insights
    
    const trendingTaskTypes: TaskTypeTrend[] = [
      {
        type: 'Content Creation',
        growth: 25.5,
        volume: 156,
        avgReward: 18.5
      },
      {
        type: 'Smart Contract Analysis',
        growth: 18.2,
        volume: 89,
        avgReward: 32.1
      },
      {
        type: 'Data Analysis',
        growth: 12.8,
        volume: 134,
        avgReward: 24.7
      }
    ];

    const averageRewards: RewardTrend[] = [
      {
        taskType: 'Content Creation',
        currentAvg: 18.5,
        previousAvg: 16.2,
        change: 14.2
      },
      {
        taskType: 'Code Review',
        currentAvg: 28.3,
        previousAvg: 31.1,
        change: -9.0
      }
    ];

    const competitionLevel: CompetitionLevel[] = [
      {
        taskType: 'Content Creation',
        agentCount: 45,
        competitionScore: 7
      },
      {
        taskType: 'Smart Contract Analysis',
        agentCount: 23,
        competitionScore: 4
      }
    ];

    const opportunityAreas: OpportunityArea[] = [
      {
        taskType: 'NFT Metadata Generation',
        demandScore: 8,
        supplyScore: 3,
        opportunityScore: 9,
        description: 'High demand, low competition - great opportunity for new agents'
      },
      {
        taskType: 'DeFi Protocol Documentation',
        demandScore: 7,
        supplyScore: 2,
        opportunityScore: 8,
        description: 'Growing demand with minimal competition'
      }
    ];

    const seasonalPatterns: SeasonalPattern[] = [
      {
        taskType: 'Content Creation',
        pattern: 'cyclical',
        confidence: 0.85,
        description: 'Higher demand during weekdays, peaks on Tuesday-Thursday'
      }
    ];

    return {
      trendingTaskTypes,
      averageRewards,
      competitionLevel,
      opportunityAreas,
      seasonalPatterns,
    };
  }

  /**
   * Calculate ROI for staking vs direct payments
   */
  calculateStakingROI(
    stakedAmount: number,
    creditsUsed: number,
    timeframe: number // days
  ): {
    stakingROI: number;
    directPaymentCost: number;
    savings: number;
    breakEvenPoint: number; // days
  } {
    const creditRate = 0.05; // $0.05 per credit
    const stakingRate = 0.2; // 20% bonus credits for staking
    
    const directPaymentCost = creditsUsed * creditRate;
    const stakingCost = stakedAmount;
    const stakingCredits = stakedAmount / creditRate * (1 + stakingRate);
    const stakingValue = Math.min(creditsUsed, stakingCredits) * creditRate;
    
    const savings = directPaymentCost - stakingValue;
    const stakingROI = (savings / stakingCost) * 100;
    
    // Calculate break-even point
    const dailyCreditUsage = creditsUsed / timeframe;
    const dailySavings = dailyCreditUsage * creditRate * stakingRate;
    const breakEvenPoint = stakingCost / dailySavings;

    return {
      stakingROI,
      directPaymentCost,
      savings,
      breakEvenPoint,
    };
  }

  /**
   * Predict agent performance based on historical data
   */
  predictAgentPerformance(agent: Agent, days: number = 30): {
    predictedRuns: number;
    predictedEarnings: number;
    confidenceLevel: number;
    factors: string[];
  } {
    const { successRate, totalRuns, avgReward } = agent.performanceMetrics;
    
    // Simple prediction model (in production, this would use ML)
    const dailyRuns = totalRuns / 30; // Assume 30 days of history
    const predictedRuns = Math.round(dailyRuns * days);
    const predictedSuccessfulRuns = predictedRuns * (successRate / 100);
    const predictedEarnings = predictedSuccessfulRuns * avgReward;
    
    // Confidence based on historical performance consistency
    const confidenceLevel = Math.min(90, 50 + (successRate / 2));
    
    const factors = [
      'Historical success rate',
      'Average reward trend',
      'Market demand patterns',
      'Competition level'
    ];

    return {
      predictedRuns,
      predictedEarnings,
      confidenceLevel,
      factors,
    };
  }

  /**
   * Generate recent activity events
   */
  private generateRecentActivity(
    agents: Agent[],
    bounties: Bounty[],
    transactions: CreditTransaction[]
  ): ActivityEvent[] {
    const activities: ActivityEvent[] = [];

    // Add agent creation events
    agents.forEach(agent => {
      activities.push({
        id: `agent_${agent.agentId}`,
        type: 'agent_created',
        timestamp: agent.createdAt,
        description: `Created agent "${agent.name}"`,
        agentId: agent.agentId,
      });
    });

    // Add bounty completion events
    bounties
      .filter(b => b.status === 'closed')
      .forEach(bounty => {
        activities.push({
          id: `bounty_${bounty.bountyId}`,
          type: 'bounty_completed',
          timestamp: bounty.updatedAt,
          description: `Completed bounty "${bounty.title}"`,
          value: bounty.rewardAmount,
          bountyId: bounty.bountyId,
        });
      });

    // Add earning events
    transactions
      .filter(t => t.type === 'earn')
      .forEach(transaction => {
        activities.push({
          id: `earn_${transaction.transactionId}`,
          type: 'credits_earned',
          timestamp: transaction.timestamp,
          description: `Earned ${transaction.amount} credits`,
          value: transaction.amount,
        });
      });

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Generate performance trend data
   */
  private generatePerformanceTrend(agent: Agent): PerformanceTrendPoint[] {
    const points: PerformanceTrendPoint[] = [];
    const baseDate = new Date();
    
    // Generate 30 days of trend data (mock)
    for (let i = 29; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      // Add some variance to the base metrics
      const variance = (Math.random() - 0.5) * 0.2;
      
      points.push({
        date: date.toISOString().split('T')[0],
        successRate: Math.max(0, Math.min(100, 
          agent.performanceMetrics.successRate + (variance * 20)
        )),
        totalRuns: Math.max(0, 
          Math.round(agent.performanceMetrics.totalRuns / 30 + (variance * 5))
        ),
        avgReward: Math.max(0, 
          agent.performanceMetrics.avgReward + (variance * 10)
        ),
      });
    }

    return points;
  }

  /**
   * Generate earnings history
   */
  private generateEarningsHistory(agent: Agent): EarningsPoint[] {
    const points: EarningsPoint[] = [];
    const baseDate = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      const dailyRuns = Math.max(0, Math.round(agent.performanceMetrics.totalRuns / 30));
      const dailyEarnings = dailyRuns * agent.performanceMetrics.avgReward * 
        (agent.performanceMetrics.successRate / 100);
      
      points.push({
        date: date.toISOString().split('T')[0],
        amount: dailyEarnings,
        bountyCount: dailyRuns,
      });
    }

    return points;
  }

  /**
   * Analyze task type distribution
   */
  private analyzeTaskTypes(agent: Agent): TaskTypeStats[] {
    // Mock data - in production, this would analyze actual task history
    return [
      {
        type: 'Content Creation',
        count: 15,
        successRate: 92,
        avgReward: 18.5
      },
      {
        type: 'Code Review',
        count: 8,
        successRate: 87,
        avgReward: 25.2
      },
      {
        type: 'Data Analysis',
        count: 5,
        successRate: 95,
        avgReward: 22.1
      }
    ];
  }

  /**
   * Get competitor comparison data
   */
  private async getCompetitorComparison(agent: Agent): Promise<CompetitorStats[]> {
    // Mock data - in production, this would query similar agents
    return [
      {
        agentName: 'ContentMaster Pro',
        successRate: 89,
        avgReward: 16.8,
        totalRuns: 67
      },
      {
        agentName: 'AI Writer Plus',
        successRate: 94,
        avgReward: 19.2,
        totalRuns: 45
      },
      {
        agentName: 'Smart Creator',
        successRate: 85,
        avgReward: 15.5,
        totalRuns: 78
      }
    ];
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(agent: Agent): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Analyze performance and suggest improvements
    if (agent.performanceMetrics.successRate < 85) {
      suggestions.push({
        type: 'prompt',
        priority: 'high',
        title: 'Optimize Agent Prompt',
        description: 'Your success rate is below average. Consider refining your prompt template for better task completion.',
        expectedImpact: '+15-20% success rate',
        implementationEffort: 'medium'
      });
    }

    if (agent.performanceMetrics.avgReward < 20) {
      suggestions.push({
        type: 'pricing',
        priority: 'medium',
        title: 'Target Higher-Value Tasks',
        description: 'Focus on bounties with higher rewards to increase your average earnings.',
        expectedImpact: '+25-30% average reward',
        implementationEffort: 'easy'
      });
    }

    suggestions.push({
      type: 'timing',
      priority: 'low',
      title: 'Optimize Task Timing',
      description: 'Analyze when bounties are posted and be among the first to claim high-value tasks.',
      expectedImpact: '+10-15% task acquisition rate',
      implementationEffort: 'easy'
    });

    return suggestions;
  }
}

export const analyticsService = new AnalyticsService();
export type {
  PerformanceMetrics,
  AgentAnalytics,
  MarketInsights,
  ActivityEvent,
  OptimizationSuggestion,
  TaskTypeTrend,
  OpportunityArea
};
