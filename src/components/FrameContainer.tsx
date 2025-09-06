import React, { useState, useEffect } from 'react';
import { farcasterService, FrameMetadata } from '../services/farcaster';
import { useUser } from '../contexts/UserContext';
import { PrimaryButton } from './PrimaryButton';
import { LoadingSpinner } from './LoadingSpinner';
import { Bot, TrendingUp, Coins, ExternalLink } from 'lucide-react';

interface FrameContainerProps {
  type: 'launch' | 'stake' | 'bounty' | 'dashboard';
  data?: any;
  onAction?: (action: string, data?: any) => void;
  className?: string;
}

export const FrameContainer: React.FC<FrameContainerProps> = ({
  type,
  data,
  onAction,
  className = ''
}) => {
  const { user } = useUser();
  const [frameMetadata, setFrameMetadata] = useState<FrameMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const metadata = farcasterService.generateFrameMetadata(type, data);
    setFrameMetadata(metadata);
    
    // Generate shareable URL
    if (data?.agentId) {
      setShareUrl(farcasterService.createShareableFrame('agent', data.agentId));
    } else if (data?.bountyId) {
      setShareUrl(farcasterService.createShareableFrame('bounty', data.bountyId));
    }
  }, [type, data]);

  const handleButtonClick = async (buttonIndex: number) => {
    if (!frameMetadata) return;
    
    setIsLoading(true);
    
    try {
      const button = frameMetadata.buttons[buttonIndex - 1];
      
      if (button.action === 'link' && button.target) {
        window.open(button.target, '_blank');
        return;
      }

      // Handle post actions
      const response = farcasterService.handleFrameAction(type, buttonIndex, inputText);
      
      if (response.redirect) {
        window.location.href = response.redirect;
      } else if (response.frame) {
        setFrameMetadata(response.frame);
      }
      
      if (onAction) {
        onAction(type, { buttonIndex, inputText, response });
      }
      
      // Clear input after action
      setInputText('');
      
    } catch (error) {
      console.error('Frame action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.share({
        title: 'AgentBloom',
        text: 'Check out this AI agent on AgentBloom!',
        url: shareUrl,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      // You could show a toast notification here
    }
  };

  const renderFrameContent = () => {
    switch (type) {
      case 'launch':
        return (
          <div className="text-center space-y-4">
            <Bot className="w-16 h-16 mx-auto text-purple-400" />
            <h2 className="text-2xl font-bold">Launch Your AI Agent</h2>
            <p className="text-gray-300">
              Deploy intelligent agents to complete on-chain tasks and earn rewards
            </p>
            {frameMetadata?.inputText && (
              <input
                type="text"
                placeholder={frameMetadata.inputText}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            )}
          </div>
        );

      case 'stake':
        return (
          <div className="text-center space-y-4">
            <Coins className="w-16 h-16 mx-auto text-green-400" />
            <h2 className="text-2xl font-bold">Stake for Credits</h2>
            <p className="text-gray-300">
              Stake tokens to get better rates and bonus credits for your agents
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="font-semibold">$20</div>
                <div className="text-gray-400">400 credits</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="font-semibold">$50</div>
                <div className="text-gray-400">1,100 credits</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="font-semibold">$100</div>
                <div className="text-gray-400">2,400 credits</div>
              </div>
            </div>
          </div>
        );

      case 'bounty':
        return (
          <div className="text-center space-y-4">
            <TrendingUp className="w-16 h-16 mx-auto text-blue-400" />
            <h2 className="text-2xl font-bold">
              {data?.title || 'Bounty Available'}
            </h2>
            <p className="text-gray-300">
              {data?.description || 'Complete this task with your AI agent'}
            </p>
            {data?.rewardAmount && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 font-semibold">
                  Reward: ${data.rewardAmount}
                </div>
              </div>
            )}
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-4">
              <Bot className="w-12 h-12 text-purple-400" />
              <TrendingUp className="w-12 h-12 text-blue-400" />
              <Coins className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold">AgentBloom Dashboard</h2>
            <p className="text-gray-300">
              Manage your AI agents and track bounty performance
            </p>
            {user && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="font-semibold">{user.creditBalance}</div>
                  <div className="text-gray-400">Credits</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="font-semibold">${user.stakedAmount}</div>
                  <div className="text-gray-400">Staked</div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  if (!frameMetadata) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`glass-effect rounded-2xl p-6 border border-white/10 ${className}`}>
      {/* Frame Content */}
      <div className="mb-6">
        {renderFrameContent()}
      </div>

      {/* Frame Buttons */}
      <div className="space-y-3">
        {frameMetadata.buttons.map((button, index) => (
          <PrimaryButton
            key={index}
            onClick={() => handleButtonClick(index + 1)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            variant={index === 0 ? 'default' : 'secondary'}
          >
            {isLoading && <LoadingSpinner />}
            {button.label}
            {button.action === 'link' && <ExternalLink className="w-4 h-4" />}
          </PrimaryButton>
        ))}
      </div>

      {/* Share Button */}
      {shareUrl && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={handleShare}
            className="w-full text-sm text-gray-400 hover:text-white transition-colors"
          >
            Share this Frame
          </button>
        </div>
      )}

      {/* Frame Metadata (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs text-gray-500">
          <summary>Frame Metadata (Dev)</summary>
          <pre className="mt-2 p-2 bg-black/20 rounded overflow-auto">
            {JSON.stringify(frameMetadata, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

// Frame Preview Component for testing
export const FramePreview: React.FC<{
  metadata: FrameMetadata;
  title?: string;
}> = ({ metadata, title = 'AgentBloom' }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <img 
        src={metadata.image} 
        alt="Frame preview" 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <div className="space-y-2">
          {metadata.buttons.map((button, index) => (
            <button
              key={index}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {button.label}
            </button>
          ))}
        </div>
        {metadata.inputText && (
          <input
            type="text"
            placeholder={metadata.inputText}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        )}
      </div>
    </div>
  );
};
