import React, { useState } from 'react';
import { ArrowLeft, Bot, Zap, DollarSign, Star } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { TextInput } from './TextInput';
import { LoadingSpinner } from './LoadingSpinner';
import { useUser } from '../contexts/UserContext';
import { usePaymentContext } from '../hooks/usePaymentContext';

interface AgentLaunchProps {
  onBack: () => void;
}

export const AgentLaunch: React.FC<AgentLaunchProps> = ({ onBack }) => {
  const { user, addAgent, updateUser } = useUser();
  const { createSession } = usePaymentContext();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    promptTemplate: ''
  });
  const [launchMethod, setLaunchMethod] = useState<'direct' | 'stake'>('direct');
  const [isLaunching, setIsLaunching] = useState(false);
  const [isStaking, setIsStaking] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDirectLaunch = async () => {
    if (!user || !formData.name || !formData.description || !formData.promptTemplate) return;

    setIsLaunching(true);
    try {
      // Process payment
      await createSession({ amount: "$5.00", description: "Agent Launch Fee" });
      
      // Create agent
      addAgent({
        name: formData.name,
        description: formData.description,
        promptTemplate: formData.promptTemplate,
        performanceMetrics: {
          successRate: 0,
          totalRuns: 0,
          avgReward: 0
        },
        status: 'active'
      });

      // Reset form
      setFormData({ name: '', description: '', promptTemplate: '' });
      
      // Redirect to dashboard
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (error) {
      console.error('Launch failed:', error);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleStakeForCredits = async () => {
    if (!user) return;

    setIsStaking(true);
    try {
      // Process staking payment
      await createSession({ amount: "$20.00", description: "Stake for Credits" });
      
      // Update user balance
      updateUser({
        creditBalance: user.creditBalance + 50, // 50 credits for $20 stake
        stakedAmount: user.stakedAmount + 20
      });

      alert('Successfully staked $20 for 50 credits!');
    } catch (error) {
      console.error('Staking failed:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleCreditLaunch = () => {
    if (!user || user.creditBalance < 10 || !formData.name || !formData.description || !formData.promptTemplate) return;

    // Deduct credits
    updateUser({ creditBalance: user.creditBalance - 10 });
    
    // Create agent
    addAgent({
      name: formData.name,
      description: formData.description,
      promptTemplate: formData.promptTemplate,
      performanceMetrics: {
        successRate: 0,
        totalRuns: 0,
        avgReward: 0
      },
      status: 'active'
    });

    // Reset form
    setFormData({ name: '', description: '', promptTemplate: '' });
    
    // Redirect to dashboard
    setTimeout(() => {
      onBack();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Launch AI Agent</h1>
          <p className="text-gray-300 mt-1">Deploy intelligent agents to complete on-chain tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-400" />
              Agent Configuration
            </h2>

            <div className="space-y-4">
              <TextInput
                label="Agent Name"
                placeholder="e.g., Content Creator AI"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                required
              />

              <TextInput
                label="Description"
                placeholder="Describe what your agent specializes in..."
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                variant="area"
                required
              />

              <TextInput
                label="Prompt Template"
                placeholder="Enter the base prompt your agent will use. Use {variable} for dynamic inputs."
                value={formData.promptTemplate}
                onChange={(value) => handleInputChange('promptTemplate', value)}
                variant="area"
                required
              />
            </div>

            {/* Prompt Examples */}
            <div className="mt-6 p-4 bg-black/20 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Example Prompts:</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <div>• "Create engaging social media content about: {topic}"</div>
                <div>• "Analyze and optimize this smart contract: {code}"</div>
                <div>• "Generate a comprehensive report on: {subject}"</div>
              </div>
            </div>
          </div>
        </div>

        {/* Launch Options */}
        <div className="space-y-6">
          {/* Launch Method Selection */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Launch Method</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="direct"
                  checked={launchMethod === 'direct'}
                  onChange={(e) => setLaunchMethod(e.target.value as 'direct' | 'stake')}
                  className="text-purple-500"
                />
                <div className="flex-1">
                  <div className="font-medium">Direct Payment</div>
                  <div className="text-sm text-gray-400">Pay $5 to launch immediately</div>
                </div>
                <DollarSign className="w-5 h-5 text-green-400" />
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="credits"
                  checked={launchMethod === 'stake'}
                  onChange={(e) => setLaunchMethod('stake')}
                  className="text-purple-500"
                />
                <div className="flex-1">
                  <div className="font-medium">Use Credits</div>
                  <div className="text-sm text-gray-400">Spend 10 credits</div>
                </div>
                <Zap className="w-5 h-5 text-yellow-400" />
              </label>
            </div>
          </div>

          {/* Credit Balance */}
          {user && (
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="font-medium mb-3">Current Balance</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Credits</span>
                <span className="font-semibold">{user.creditBalance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Staked</span>
                <span className="font-semibold">${user.stakedAmount}</span>
              </div>
            </div>
          )}

          {/* Staking Option */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Stake for Credits
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Stake $20 to receive 50 credits and get better rates
            </p>
            <PrimaryButton
              onClick={handleStakeForCredits}
              disabled={isStaking}
              className="w-full"
              variant="secondary"
            >
              {isStaking ? <LoadingSpinner size="sm" /> : 'Stake $20 for 50 Credits'}
            </PrimaryButton>
          </div>

          {/* Launch Button */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            {launchMethod === 'direct' ? (
              <PrimaryButton
                onClick={handleDirectLaunch}
                disabled={isLaunching || !formData.name || !formData.description || !formData.promptTemplate}
                className="w-full"
              >
                {isLaunching ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Launching...
                  </div>
                ) : (
                  'Launch Agent ($5)'
                )}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={handleCreditLaunch}
                disabled={!user || user.creditBalance < 10 || !formData.name || !formData.description || !formData.promptTemplate}
                className="w-full"
              >
                Launch Agent (10 Credits)
              </PrimaryButton>
            )}
            
            {launchMethod === 'stake' && user && user.creditBalance < 10 && (
              <p className="text-sm text-red-400 mt-2">
                Insufficient credits. Need 10 credits to launch.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};