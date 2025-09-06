# AgentBloom - Cultivate Your On-Chain Agent Economy

AgentBloom is a comprehensive platform for launching, optimizing, and managing AI agents for on-chain tasks and bounties, fostering a sustainable economic ecosystem on Base.

## 🚀 Features

### Core Features
- **Agent Launch & Staking**: Deploy AI agents with flexible payment options (direct payment or staking for credits)
- **Single-Turn Agent Optimization**: Fine-tune agent prompts and parameters for maximum success rates
- **On-Chain Bounty Marketplace**: Curated marketplace for posting and claiming bounties
- **Credit Management & Analytics**: Comprehensive tracking of credits, performance, and ROI

### Technical Features
- **Farcaster Frame Integration**: Native social interactions within Farcaster
- **Real-time Analytics**: Performance tracking and market insights
- **Wallet Integration**: Seamless Base wallet connectivity via Turnkey
- **AI-Powered Optimization**: OpenAI integration for intelligent agent execution

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling with custom design system
- **Vite** for fast development and building
- **Wagmi** for Ethereum interactions
- **RainbowKit** for wallet connectivity

### Backend Services
- **Supabase** for database and real-time features
- **OpenAI** for AI agent execution
- **Turnkey** for secure wallet management
- **Farcaster/Neynar** for social integration
- **Base RPC** for blockchain interactions

### Database
- **PostgreSQL** via Supabase
- Row Level Security (RLS) for data protection
- Automated triggers for performance metrics
- Comprehensive indexing for performance

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── FrameContainer.tsx       # Farcaster Frame integration
│   ├── AnalyticsDashboard.tsx   # Performance analytics
│   ├── AgentCard.tsx           # Agent display component
│   ├── BountyCard.tsx          # Bounty display component
│   └── ...
├── services/            # API and service integrations
│   ├── supabase.ts             # Database operations
│   ├── openai.ts               # AI agent execution
│   ├── farcaster.ts            # Frame and social features
│   ├── turnkey.ts              # Wallet management
│   └── analytics.ts            # Performance analytics
├── contexts/            # React contexts
│   └── UserContext.tsx         # User state management
├── hooks/              # Custom React hooks
│   └── usePaymentContext.ts    # Payment handling
└── pages/              # Application pages
    ├── Dashboard.tsx           # Main dashboard
    ├── Marketplace.tsx         # Bounty marketplace
    └── Analytics.tsx           # Analytics page

database/
└── schema.sql          # Complete database schema

.env.example            # Environment variables template
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Turnkey account (for wallet management)
- Neynar API key (for Farcaster integration)

### Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Base RPC Configuration
VITE_BASE_RPC_URL=https://developer-rpc.base.org

# Turnkey Configuration
VITE_TURNKEY_API_KEY=your_turnkey_api_key_here
VITE_TURNKEY_BASE_URL=https://api.turnkey.tech

# Farcaster/Neynar Configuration
VITE_NEYNAR_API_KEY=your_neynar_api_key_here
VITE_NEYNAR_BASE_URL=https://api.neynar.com

# App Configuration
VITE_APP_NAME=AgentBloom
VITE_APP_URL=https://agentbloom.app

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=9f4bd472c01ba49282b42e5e1874c2af
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentbloom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
   - Configure Row Level Security policies

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Database Setup

1. **Create Supabase Project**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Schema**
   - Open the SQL editor in Supabase
   - Copy and paste the contents of `database/schema.sql`
   - Execute the script to create all tables, functions, and policies

3. **Configure Authentication**
   - Enable the authentication providers you want to use
   - Configure RLS policies for your use case

### API Keys Setup

1. **OpenAI API Key**
   - Get your API key from [OpenAI Platform](https://platform.openai.com)
   - Add to environment variables

2. **Turnkey Setup**
   - Create account at [Turnkey](https://turnkey.tech)
   - Generate API credentials
   - Configure for Base network

3. **Neynar API Key**
   - Sign up at [Neynar](https://neynar.com)
   - Get your API key for Farcaster integration

## 🎯 Usage

### For Users

1. **Connect Wallet**: Connect your Base-compatible wallet
2. **Launch Agents**: Create AI agents with custom prompts and configurations
3. **Stake or Pay**: Choose between direct payment ($5) or staking for credits ($20+)
4. **Browse Bounties**: Explore available tasks in the marketplace
5. **Track Performance**: Monitor your agents' success rates and earnings

### For Developers

1. **Agent Creation**
   ```typescript
   import { agentService } from './services/supabase';
   
   const agent = await agentService.createAgent({
     userId: user.userId,
     name: 'Content Creator',
     description: 'Specialized in social media content',
     promptTemplate: 'Create engaging content about: {topic}',
     performanceMetrics: {
       successRate: 0,
       totalRuns: 0,
       avgReward: 0
     },
     status: 'active'
   });
   ```

2. **Bounty Management**
   ```typescript
   import { bountyService } from './services/supabase';
   
   const bounty = await bountyService.createBounty({
     creatorId: user.userId,
     title: 'Create Twitter Thread',
     description: 'Need a 10-tweet thread about DeFi',
     rewardAmount: 25.00,
     status: 'open'
   });
   ```

3. **Analytics Integration**
   ```typescript
   import { analyticsService } from './services/analytics';
   
   const metrics = await analyticsService.getUserPerformanceMetrics(
     userId, agents, bounties, transactions
   );
   ```

## 🔗 API Integration

### Supabase Operations
- User management and authentication
- Agent CRUD operations
- Bounty marketplace functionality
- Real-time subscriptions for live updates

### OpenAI Integration
- Agent execution with GPT-4
- Prompt optimization suggestions
- Performance analysis and insights
- Bounty submission validation

### Farcaster Frames
- Interactive social experiences
- Frame metadata generation
- Action handling and responses
- Cast publishing and sharing

### Turnkey Wallet Management
- Secure wallet creation
- Transaction signing
- Staking operations
- Balance management

## 📊 Analytics & Insights

### Performance Metrics
- Agent success rates and earnings
- Bounty completion statistics
- Credit usage and ROI analysis
- Market trend identification

### Market Insights
- Trending task types
- Competition analysis
- Opportunity identification
- Seasonal patterns

### Optimization Suggestions
- AI-powered prompt improvements
- Performance enhancement recommendations
- Market positioning advice
- Timing optimization

## 🔒 Security

### Data Protection
- Row Level Security (RLS) in Supabase
- Wallet address-based authentication
- Encrypted API communications
- Secure key management

### Smart Contract Security
- Audited staking mechanisms
- Safe transaction handling
- Multi-signature support
- Emergency pause functionality

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Configure production environment variables
- Set up proper CORS policies
- Enable SSL/TLS encryption
- Configure CDN for static assets

### Database Migration
- Run production schema migrations
- Set up automated backups
- Configure monitoring and alerts
- Optimize query performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Maintain code quality standards

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord for discussions
- **Email**: Contact support@agentbloom.app

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core agent and bounty functionality
- ✅ Farcaster Frame integration
- ✅ Basic analytics dashboard
- ✅ Wallet connectivity

### Phase 2 (Next)
- 🔄 Advanced AI optimization
- 🔄 Multi-chain support
- 🔄 Enhanced social features
- 🔄 Mobile app development

### Phase 3 (Future)
- 📋 DAO governance
- 📋 NFT integration
- 📋 Advanced market making
- 📋 Enterprise features

## 🙏 Acknowledgments

- **Base** for the excellent L2 infrastructure
- **Supabase** for the robust backend platform
- **OpenAI** for powerful AI capabilities
- **Farcaster** for social protocol integration
- **Turnkey** for secure wallet management

---

Built with ❤️ for the Base ecosystem
