-- AgentBloom Database Schema for Supabase
-- This file contains the complete database schema for the AgentBloom application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    user_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    farcaster_id TEXT UNIQUE,
    wallet_address TEXT UNIQUE NOT NULL,
    credit_balance INTEGER DEFAULT 100,
    staked_amount DECIMAL(18, 6) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents table
CREATE TABLE agents (
    agent_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    prompt_template TEXT NOT NULL,
    performance_metrics JSONB DEFAULT '{
        "successRate": 0,
        "totalRuns": 0,
        "avgReward": 0
    }'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bounties table
CREATE TABLE bounties (
    bounty_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    creator_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'inProgress', 'closed', 'cancelled')),
    assigned_agent_id TEXT REFERENCES agents(agent_id) ON DELETE SET NULL,
    task_type TEXT,
    requirements JSONB DEFAULT '{}'::jsonb,
    submission_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions table
CREATE TABLE credit_transactions (
    transaction_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('stake', 'unstake', 'spend', 'earn', 'refund')),
    amount INTEGER NOT NULL,
    description TEXT,
    related_bounty_id TEXT REFERENCES bounties(bounty_id) ON DELETE SET NULL,
    related_agent_id TEXT REFERENCES agents(agent_id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent executions table (for tracking individual agent runs)
CREATE TABLE agent_executions (
    execution_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    agent_id TEXT NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    bounty_id TEXT REFERENCES bounties(bounty_id) ON DELETE SET NULL,
    input_data JSONB NOT NULL,
    output_data JSONB,
    success BOOLEAN DEFAULT FALSE,
    tokens_used INTEGER DEFAULT 0,
    execution_time INTEGER DEFAULT 0, -- in milliseconds
    cost DECIMAL(10, 6) DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent optimization history
CREATE TABLE agent_optimizations (
    optimization_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    agent_id TEXT NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    old_prompt TEXT NOT NULL,
    new_prompt TEXT NOT NULL,
    optimization_type TEXT NOT NULL CHECK (optimization_type IN ('manual', 'ai_suggested', 'performance_based')),
    performance_before JSONB,
    performance_after JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bounty submissions table
CREATE TABLE bounty_submissions (
    submission_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    bounty_id TEXT NOT NULL REFERENCES bounties(bounty_id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL,
    validation_score INTEGER CHECK (validation_score >= 0 AND validation_score <= 100),
    validation_feedback TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Farcaster frames table (for tracking frame interactions)
CREATE TABLE farcaster_frames (
    frame_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    frame_type TEXT NOT NULL CHECK (frame_type IN ('launch', 'stake', 'bounty', 'dashboard')),
    user_fid INTEGER,
    interaction_data JSONB NOT NULL,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market analytics table (for caching market insights)
CREATE TABLE market_analytics (
    analytics_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    analytics_type TEXT NOT NULL CHECK (analytics_type IN ('task_trends', 'reward_trends', 'competition_levels')),
    data JSONB NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_farcaster_id ON users(farcaster_id);
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_bounties_creator_id ON bounties(creator_id);
CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounties_assigned_agent_id ON bounties(assigned_agent_id);
CREATE INDEX idx_bounties_task_type ON bounties(task_type);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_timestamp ON credit_transactions(timestamp);
CREATE INDEX idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX idx_agent_executions_bounty_id ON agent_executions(bounty_id);
CREATE INDEX idx_agent_executions_created_at ON agent_executions(created_at);
CREATE INDEX idx_bounty_submissions_bounty_id ON bounty_submissions(bounty_id);
CREATE INDEX idx_bounty_submissions_agent_id ON bounty_submissions(agent_id);
CREATE INDEX idx_bounty_submissions_status ON bounty_submissions(status);
CREATE INDEX idx_market_analytics_type ON market_analytics(analytics_type);
CREATE INDEX idx_market_analytics_expires_at ON market_analytics(expires_at);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bounties_updated_at BEFORE UPDATE ON bounties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update agent performance metrics
CREATE OR REPLACE FUNCTION update_agent_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update performance metrics when a new execution is added
    UPDATE agents 
    SET performance_metrics = (
        SELECT jsonb_build_object(
            'successRate', ROUND(
                (COUNT(*) FILTER (WHERE success = true)::float / COUNT(*)::float) * 100, 2
            ),
            'totalRuns', COUNT(*),
            'avgReward', COALESCE(AVG(
                CASE WHEN success = true THEN 
                    (SELECT reward_amount FROM bounties WHERE bounty_id = agent_executions.bounty_id)
                ELSE 0 END
            ), 0)
        )
        FROM agent_executions 
        WHERE agent_id = NEW.agent_id
    )
    WHERE agent_id = NEW.agent_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update agent performance metrics
CREATE TRIGGER update_agent_metrics_on_execution 
    AFTER INSERT ON agent_executions
    FOR EACH ROW EXECUTE FUNCTION update_agent_performance_metrics();

-- Function to handle credit transactions
CREATE OR REPLACE FUNCTION process_credit_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user credit balance based on transaction type
    CASE NEW.type
        WHEN 'earn', 'refund' THEN
            UPDATE users 
            SET credit_balance = credit_balance + NEW.amount
            WHERE user_id = NEW.user_id;
        WHEN 'spend' THEN
            UPDATE users 
            SET credit_balance = credit_balance - NEW.amount
            WHERE user_id = NEW.user_id;
        WHEN 'stake' THEN
            UPDATE users 
            SET staked_amount = staked_amount + (NEW.amount::decimal / 100) -- Convert credits to dollars
            WHERE user_id = NEW.user_id;
        WHEN 'unstake' THEN
            UPDATE users 
            SET staked_amount = staked_amount - (NEW.amount::decimal / 100)
            WHERE user_id = NEW.user_id;
    END CASE;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for credit transaction processing
CREATE TRIGGER process_credit_transaction_trigger
    AFTER INSERT ON credit_transactions
    FOR EACH ROW EXECUTE FUNCTION process_credit_transaction();

-- Function to clean up expired market analytics
CREATE OR REPLACE FUNCTION cleanup_expired_analytics()
RETURNS void AS $$
BEGIN
    DELETE FROM market_analytics WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_submissions ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = user_id OR wallet_address = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = user_id OR wallet_address = auth.jwt() ->> 'wallet_address');

-- Agents policies
CREATE POLICY "Users can view own agents" ON agents
    FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id));

CREATE POLICY "Users can create own agents" ON agents
    FOR INSERT WITH CHECK (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id));

CREATE POLICY "Users can update own agents" ON agents
    FOR UPDATE USING (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id));

-- Bounties policies (users can see all bounties but only modify their own)
CREATE POLICY "Anyone can view bounties" ON bounties FOR SELECT USING (true);

CREATE POLICY "Users can create bounties" ON bounties
    FOR INSERT WITH CHECK (creator_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id));

CREATE POLICY "Users can update own bounties" ON bounties
    FOR UPDATE USING (creator_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id));

-- Credit transactions policies
CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id));

-- Agent executions policies
CREATE POLICY "Users can view own agent executions" ON agent_executions
    FOR SELECT USING (agent_id IN (SELECT agent_id FROM agents WHERE user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = user_id)));

-- Sample data for development/testing
INSERT INTO users (user_id, wallet_address, credit_balance, staked_amount) VALUES
    ('user_sample_1', '0x1234567890123456789012345678901234567890', 150, 25.00),
    ('user_sample_2', '0x0987654321098765432109876543210987654321', 200, 50.00);

INSERT INTO agents (agent_id, user_id, name, description, prompt_template, performance_metrics) VALUES
    ('agent_sample_1', 'user_sample_1', 'Content Creator AI', 'Specialized in creating engaging social media content', 'Create engaging content about: {topic}', '{"successRate": 92, "totalRuns": 45, "avgReward": 12.5}'),
    ('agent_sample_2', 'user_sample_1', 'Code Assistant', 'Helps with smart contract development', 'Analyze and improve this code: {code}', '{"successRate": 88, "totalRuns": 32, "avgReward": 18.3}');

INSERT INTO bounties (bounty_id, creator_id, title, description, reward_amount, task_type) VALUES
    ('bounty_sample_1', 'user_sample_2', 'Create Twitter Thread About DeFi', 'Need a 10-tweet thread explaining DeFi lending protocols', 25.00, 'Content Creation'),
    ('bounty_sample_2', 'user_sample_2', 'Smart Contract Security Audit', 'Review and audit a simple ERC-20 token contract', 50.00, 'Code Review'),
    ('bounty_sample_3', 'user_sample_1', 'Blog Post About Base Chain', 'Write a comprehensive blog post about Base chain benefits', 30.00, 'Content Creation');

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user account information including wallet addresses and credit balances';
COMMENT ON TABLE agents IS 'AI agents created by users with their configurations and performance metrics';
COMMENT ON TABLE bounties IS 'Tasks posted by users that can be completed by AI agents';
COMMENT ON TABLE credit_transactions IS 'All credit-related transactions including staking, spending, and earning';
COMMENT ON TABLE agent_executions IS 'Individual runs of agents on specific tasks with performance data';
COMMENT ON TABLE agent_optimizations IS 'History of agent prompt optimizations and their results';
COMMENT ON TABLE bounty_submissions IS 'Submissions made by agents for bounties with validation results';
COMMENT ON TABLE farcaster_frames IS 'Farcaster frame interactions for social integration';
COMMENT ON TABLE market_analytics IS 'Cached market insights and analytics data';

-- Create a view for agent performance summary
CREATE VIEW agent_performance_summary AS
SELECT 
    a.agent_id,
    a.name,
    a.user_id,
    a.performance_metrics,
    COUNT(ae.execution_id) as total_executions,
    COUNT(ae.execution_id) FILTER (WHERE ae.success = true) as successful_executions,
    AVG(ae.tokens_used) as avg_tokens_used,
    AVG(ae.execution_time) as avg_execution_time,
    SUM(ae.cost) as total_cost
FROM agents a
LEFT JOIN agent_executions ae ON a.agent_id = ae.agent_id
GROUP BY a.agent_id, a.name, a.user_id, a.performance_metrics;

-- Create a view for bounty statistics
CREATE VIEW bounty_statistics AS
SELECT 
    task_type,
    COUNT(*) as total_bounties,
    COUNT(*) FILTER (WHERE status = 'closed') as completed_bounties,
    AVG(reward_amount) as avg_reward,
    MIN(reward_amount) as min_reward,
    MAX(reward_amount) as max_reward
FROM bounties
GROUP BY task_type;

COMMENT ON VIEW agent_performance_summary IS 'Aggregated performance metrics for all agents';
COMMENT ON VIEW bounty_statistics IS 'Statistical summary of bounties by task type';
