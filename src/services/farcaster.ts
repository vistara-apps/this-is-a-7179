import axios from 'axios';

const NEYNAR_API_KEY = import.meta.env.VITE_NEYNAR_API_KEY;
const NEYNAR_BASE_URL = import.meta.env.VITE_NEYNAR_BASE_URL || 'https://api.neynar.com';

interface FrameActionPayload {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
}

interface FrameMetadata {
  version: string;
  image: string;
  buttons: FrameButton[];
  inputText?: string;
  postUrl?: string;
  refreshPeriod?: number;
}

interface FrameButton {
  label: string;
  action?: 'post' | 'post_redirect' | 'link' | 'mint';
  target?: string;
}

interface CastData {
  hash: string;
  parentHash?: string;
  parentUrl?: string;
  rootParentUrl?: string;
  parentAuthor?: {
    fid: number;
  };
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    profile: {
      bio: {
        text: string;
      };
    };
  };
  text: string;
  timestamp: string;
  embeds: Array<{
    url?: string;
    castId?: {
      fid: number;
      hash: string;
    };
  }>;
  reactions: {
    likesCount: number;
    recastsCount: number;
    repliesCount: number;
  };
  replies: {
    count: number;
  };
  threadHash?: string;
  type: string;
}

class FarcasterService {
  private apiClient = axios.create({
    baseURL: NEYNAR_BASE_URL,
    headers: {
      'api_key': NEYNAR_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  /**
   * Validate a frame action payload
   */
  async validateFrameAction(payload: FrameActionPayload): Promise<{
    valid: boolean;
    fid: number;
    username?: string;
    displayName?: string;
  }> {
    try {
      const response = await this.apiClient.post('/v2/farcaster-action/validate-frame', {
        messageBytesInHex: payload.trustedData.messageBytes,
      });

      const { valid, action } = response.data;
      
      if (valid && action?.interactor) {
        return {
          valid: true,
          fid: action.interactor.fid,
          username: action.interactor.username,
          displayName: action.interactor.display_name,
        };
      }

      return { valid: false, fid: 0 };
    } catch (error) {
      console.error('Frame validation error:', error);
      return { valid: false, fid: 0 };
    }
  }

  /**
   * Generate Frame metadata for AgentBloom actions
   */
  generateFrameMetadata(type: 'launch' | 'stake' | 'bounty' | 'dashboard', data?: any): FrameMetadata {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://agentbloom.app';
    
    switch (type) {
      case 'launch':
        return {
          version: 'vNext',
          image: `${baseUrl}/frames/launch-agent.png`,
          buttons: [
            { label: '🚀 Launch Agent ($5)', action: 'post' },
            { label: '💰 Stake for Credits ($20)', action: 'post' },
            { label: '📊 View Dashboard', action: 'link', target: baseUrl }
          ],
          inputText: 'Agent name and description',
          postUrl: `${baseUrl}/api/frame/launch`
        };

      case 'stake':
        return {
          version: 'vNext',
          image: `${baseUrl}/frames/stake-credits.png`,
          buttons: [
            { label: '💰 Stake $20', action: 'post' },
            { label: '💰 Stake $50', action: 'post' },
            { label: '💰 Stake $100', action: 'post' },
            { label: '🏠 Back to Dashboard', action: 'link', target: baseUrl }
          ],
          postUrl: `${baseUrl}/api/frame/stake`
        };

      case 'bounty':
        return {
          version: 'vNext',
          image: `${baseUrl}/frames/bounty-${data?.bountyId || 'default'}.png`,
          buttons: [
            { label: '🎯 Claim Bounty', action: 'post' },
            { label: '📋 View Details', action: 'link', target: `${baseUrl}/bounty/${data?.bountyId}` },
            { label: '🔍 Browse More', action: 'link', target: `${baseUrl}/marketplace` }
          ],
          postUrl: `${baseUrl}/api/frame/bounty/${data?.bountyId}/claim`
        };

      case 'dashboard':
      default:
        return {
          version: 'vNext',
          image: `${baseUrl}/frames/dashboard.png`,
          buttons: [
            { label: '🚀 Launch Agent', action: 'post' },
            { label: '🎯 Browse Bounties', action: 'post' },
            { label: '💰 Manage Credits', action: 'post' },
            { label: '🌐 Open App', action: 'link', target: baseUrl }
          ],
          postUrl: `${baseUrl}/api/frame/action`
        };
    }
  }

  /**
   * Generate HTML for a Frame
   */
  generateFrameHtml(metadata: FrameMetadata, title: string = 'AgentBloom'): string {
    const metaTags = [
      `<meta property="fc:frame" content="${metadata.version}" />`,
      `<meta property="fc:frame:image" content="${metadata.image}" />`,
      metadata.postUrl ? `<meta property="fc:frame:post_url" content="${metadata.postUrl}" />` : '',
      metadata.inputText ? `<meta property="fc:frame:input:text" content="${metadata.inputText}" />` : '',
      metadata.refreshPeriod ? `<meta property="fc:frame:refresh_period" content="${metadata.refreshPeriod}" />` : '',
      ...metadata.buttons.map((button, index) => [
        `<meta property="fc:frame:button:${index + 1}" content="${button.label}" />`,
        button.action ? `<meta property="fc:frame:button:${index + 1}:action" content="${button.action}" />` : '',
        button.target ? `<meta property="fc:frame:button:${index + 1}:target" content="${button.target}" />` : ''
      ].filter(Boolean).join('\n'))
    ].filter(Boolean).join('\n');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    
    <!-- Frame metadata -->
    ${metaTags}
    
    <!-- Open Graph metadata -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="Cultivate Your On-Chain Agent Economy" />
    <meta property="og:image" content="${metadata.image}" />
    <meta property="og:type" content="website" />
    
    <!-- Twitter metadata -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="Cultivate Your On-Chain Agent Economy" />
    <meta name="twitter:image" content="${metadata.image}" />
</head>
<body>
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
        <h1>AgentBloom</h1>
        <p>Cultivate Your On-Chain Agent Economy</p>
        <img src="${metadata.image}" alt="AgentBloom Frame" style="max-width: 100%; height: auto; border-radius: 8px;" />
    </div>
</body>
</html>`;
  }

  /**
   * Post a cast to Farcaster
   */
  async publishCast(text: string, embeds?: Array<{ url: string }>, parentHash?: string): Promise<{
    success: boolean;
    hash?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/v2/farcaster-action/publish-cast', {
        text,
        embeds: embeds || [],
        parent: parentHash ? { hash: parentHash } : undefined,
      });

      return {
        success: true,
        hash: response.data.cast?.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish cast',
      };
    }
  }

  /**
   * Get cast information
   */
  async getCast(hash: string): Promise<CastData | null> {
    try {
      const response = await this.apiClient.get(`/v2/farcaster-action/cast?hash=${hash}`);
      return response.data.cast;
    } catch (error) {
      console.error('Error fetching cast:', error);
      return null;
    }
  }

  /**
   * Get user's casts
   */
  async getUserCasts(fid: number, limit: number = 25): Promise<CastData[]> {
    try {
      const response = await this.apiClient.get(`/v2/farcaster-action/casts?fid=${fid}&limit=${limit}`);
      return response.data.casts || [];
    } catch (error) {
      console.error('Error fetching user casts:', error);
      return [];
    }
  }

  /**
   * Generate Frame image URL for dynamic content
   */
  generateFrameImageUrl(type: string, data: Record<string, any>): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://agentbloom.app';
    const params = new URLSearchParams(data).toString();
    return `${baseUrl}/api/frame/image/${type}?${params}`;
  }

  /**
   * Create a shareable Frame URL for AgentBloom content
   */
  createShareableFrame(type: 'agent' | 'bounty' | 'achievement', id: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://agentbloom.app';
    return `${baseUrl}/frame/${type}/${id}`;
  }

  /**
   * Handle Frame action responses
   */
  handleFrameAction(action: string, buttonIndex: number, inputText?: string): {
    redirect?: string;
    frame?: FrameMetadata;
    message?: string;
  } {
    switch (action) {
      case 'launch':
        if (buttonIndex === 1) {
          return {
            frame: this.generateFrameMetadata('launch'),
            message: 'Ready to launch your agent!'
          };
        } else if (buttonIndex === 2) {
          return {
            frame: this.generateFrameMetadata('stake'),
            message: 'Stake tokens for better rates!'
          };
        }
        break;

      case 'stake':
        const amounts = [20, 50, 100];
        const amount = amounts[buttonIndex - 1];
        return {
          message: `Staking $${amount} for credits...`,
          frame: this.generateFrameMetadata('dashboard')
        };

      case 'bounty':
        return {
          message: 'Bounty claimed! Your agent will start working on it.',
          frame: this.generateFrameMetadata('dashboard')
        };

      default:
        return {
          frame: this.generateFrameMetadata('dashboard'),
          message: 'Welcome to AgentBloom!'
        };
    }

    return {
      frame: this.generateFrameMetadata('dashboard')
    };
  }
}

export const farcasterService = new FarcasterService();
export type { FrameActionPayload, FrameMetadata, FrameButton, CastData };
