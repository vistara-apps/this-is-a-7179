import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  userId: string;
  farcasterId?: string;
  walletAddress: string;
  creditBalance: number;
  stakedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
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
  updatedAt: string;
}

export interface Bounty {
  bountyId: string;
  creatorId: string;
  title: string;
  description: string;
  rewardAmount: number;
  status: 'open' | 'inProgress' | 'closed';
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  transactionId: string;
  userId: string;
  type: 'stake' | 'unstake' | 'spend' | 'earn' | 'refund';
  amount: number;
  description?: string;
  timestamp: string;
}

// User Operations
export const userService = {
  async getUser(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('walletAddress', walletAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  },

  async createUser(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        userId: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('userId', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Agent Operations
export const agentService = {
  async getUserAgents(userId: string): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createAgent(agentData: Omit<Agent, 'agentId' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .insert({
        ...agentData,
        agentId: `agent_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('agentId', agentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAgent(agentId: string): Promise<void> {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('agentId', agentId);
    
    if (error) throw error;
  }
};

// Bounty Operations
export const bountyService = {
  async getAllBounties(): Promise<Bounty[]> {
    const { data, error } = await supabase
      .from('bounties')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getUserBounties(userId: string): Promise<Bounty[]> {
    const { data, error } = await supabase
      .from('bounties')
      .select('*')
      .eq('creatorId', userId)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createBounty(bountyData: Omit<Bounty, 'bountyId' | 'createdAt' | 'updatedAt'>): Promise<Bounty> {
    const { data, error } = await supabase
      .from('bounties')
      .insert({
        ...bountyData,
        bountyId: `bounty_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBounty(bountyId: string, updates: Partial<Bounty>): Promise<Bounty> {
    const { data, error } = await supabase
      .from('bounties')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('bountyId', bountyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async claimBounty(bountyId: string, agentId: string): Promise<Bounty> {
    const { data, error } = await supabase
      .from('bounties')
      .update({
        status: 'inProgress',
        assignedAgentId: agentId,
        updatedAt: new Date().toISOString()
      })
      .eq('bountyId', bountyId)
      .eq('status', 'open')
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Credit Transaction Operations
export const creditService = {
  async getUserTransactions(userId: string): Promise<CreditTransaction[]> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('userId', userId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createTransaction(transactionData: Omit<CreditTransaction, 'transactionId' | 'timestamp'>): Promise<CreditTransaction> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .insert({
        ...transactionData,
        transactionId: `tx_${Date.now()}`,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToUserAgents(userId: string, callback: (agents: Agent[]) => void) {
    return supabase
      .channel('user-agents')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'agents',
          filter: `userId=eq.${userId}`
        }, 
        () => {
          agentService.getUserAgents(userId).then(callback);
        }
      )
      .subscribe();
  },

  subscribeToBounties(callback: (bounties: Bounty[]) => void) {
    return supabase
      .channel('bounties')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bounties'
        }, 
        () => {
          bountyService.getAllBounties().then(callback);
        }
      )
      .subscribe();
  }
};
