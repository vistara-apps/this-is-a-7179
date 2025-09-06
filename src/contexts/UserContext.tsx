import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface User {
  userId: string;
  walletAddress: string;
  creditBalance: number;
  stakedAmount: number;
  agents: Agent[];
  bounties: Bounty[];
}

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

interface UserContextType {
  user: User | null;
  agents: Agent[];
  bounties: Bounty[];
  updateUser: (updates: Partial<User>) => void;
  addAgent: (agent: Omit<Agent, 'agentId' | 'userId' | 'createdAt'>) => void;
  addBounty: (bounty: Omit<Bounty, 'bountyId' | 'creatorId' | 'createdAt'>) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  updateBounty: (bountyId: string, updates: Partial<Bounty>) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);

  // Initialize user when wallet connects
  useEffect(() => {
    if (isConnected && address && !user) {
      const newUser: User = {
        userId: `user_${Date.now()}`,
        walletAddress: address,
        creditBalance: 100, // Starting credits
        stakedAmount: 0,
        agents: [],
        bounties: []
      };
      setUser(newUser);
      
      // Initialize with sample data
      const sampleAgents: Agent[] = [
        {
          agentId: 'agent_1',
          userId: newUser.userId,
          name: 'Content Creator AI',
          description: 'Specialized in creating engaging social media content and blog posts',
          promptTemplate: 'Create engaging content about: {topic}',
          performanceMetrics: {
            successRate: 92,
            totalRuns: 45,
            avgReward: 12.5
          },
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          agentId: 'agent_2',
          userId: newUser.userId,
          name: 'Code Assistant',
          description: 'Helps with smart contract development and code reviews',
          promptTemplate: 'Analyze and improve this code: {code}',
          performanceMetrics: {
            successRate: 88,
            totalRuns: 32,
            avgReward: 18.3
          },
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      
      const sampleBounties: Bounty[] = [
        {
          bountyId: 'bounty_1',
          creatorId: 'other_user',
          title: 'Create Twitter Thread About DeFi',
          description: 'Need a 10-tweet thread explaining DeFi lending protocols',
          rewardAmount: 25,
          status: 'open',
          createdAt: new Date().toISOString()
        },
        {
          bountyId: 'bounty_2',
          creatorId: 'other_user',
          title: 'Smart Contract Security Audit',
          description: 'Review and audit a simple ERC-20 token contract',
          rewardAmount: 50,
          status: 'open',
          createdAt: new Date().toISOString()
        },
        {
          bountyId: 'bounty_3',
          creatorId: newUser.userId,
          title: 'Blog Post About Base Chain',
          description: 'Write a comprehensive blog post about Base chain benefits',
          rewardAmount: 30,
          status: 'inProgress',
          assignedAgentId: 'agent_1',
          createdAt: new Date().toISOString()
        }
      ];
      
      setAgents(sampleAgents);
      setBounties(sampleBounties);
    } else if (!isConnected) {
      setUser(null);
      setAgents([]);
      setBounties([]);
    }
  }, [isConnected, address, user]);

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const addAgent = (agentData: Omit<Agent, 'agentId' | 'userId' | 'createdAt'>) => {
    if (user) {
      const newAgent: Agent = {
        ...agentData,
        agentId: `agent_${Date.now()}`,
        userId: user.userId,
        createdAt: new Date().toISOString()
      };
      setAgents(prev => [...prev, newAgent]);
    }
  };

  const addBounty = (bountyData: Omit<Bounty, 'bountyId' | 'creatorId' | 'createdAt'>) => {
    if (user) {
      const newBounty: Bounty = {
        ...bountyData,
        bountyId: `bounty_${Date.now()}`,
        creatorId: user.userId,
        createdAt: new Date().toISOString()
      };
      setBounties(prev => [...prev, newBounty]);
    }
  };

  const updateAgent = (agentId: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(agent => 
      agent.agentId === agentId ? { ...agent, ...updates } : agent
    ));
  };

  const updateBounty = (bountyId: string, updates: Partial<Bounty>) => {
    setBounties(prev => prev.map(bounty => 
      bounty.bountyId === bountyId ? { ...bounty, ...updates } : bounty
    ));
  };

  return (
    <UserContext.Provider value={{
      user,
      agents,
      bounties,
      updateUser,
      addAgent,
      addBounty,
      updateAgent,
      updateBounty
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};