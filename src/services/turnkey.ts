import axios from 'axios';

const TURNKEY_API_KEY = import.meta.env.VITE_TURNKEY_API_KEY;
const TURNKEY_BASE_URL = import.meta.env.VITE_TURNKEY_BASE_URL || 'https://api.turnkey.tech';

interface WalletCreationRequest {
  walletName: string;
  accounts: Array<{
    curve: 'CURVE_SECP256K1';
    pathFormat: 'PATH_FORMAT_BIP32';
    path: string;
    addressFormat: 'ADDRESS_FORMAT_ETHEREUM';
  }>;
}

interface WalletCreationResponse {
  walletId: string;
  addresses: string[];
}

interface TransactionRequest {
  type: 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2';
  organizationId: string;
  parameters: {
    signWith: string;
    type: 'TRANSACTION_TYPE_ETHEREUM';
    unsignedTransaction: string;
  };
  timestampMs: string;
}

interface TransactionResponse {
  activityId: string;
  result: {
    signTransactionResult: {
      signedTransaction: string;
    };
  };
}

interface StakeTransactionParams {
  amount: string; // in wei
  userAddress: string;
  contractAddress?: string;
}

interface AgentLaunchParams {
  agentName: string;
  agentDescription: string;
  promptTemplate: string;
  launchFee: string; // in wei
  userAddress: string;
}

class TurnkeyService {
  private apiClient = axios.create({
    baseURL: TURNKEY_BASE_URL,
    headers: {
      'X-API-KEY': TURNKEY_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  /**
   * Create a new wallet for a user
   */
  async createWallet(walletName: string): Promise<WalletCreationResponse> {
    try {
      const request: WalletCreationRequest = {
        walletName,
        accounts: [
          {
            curve: 'CURVE_SECP256K1',
            pathFormat: 'PATH_FORMAT_BIP32',
            path: "m/44'/60'/0'/0/0", // Standard Ethereum derivation path
            addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
          },
        ],
      };

      const response = await this.apiClient.post('/wallets/create', request);
      
      return {
        walletId: response.data.walletId,
        addresses: response.data.addresses || [],
      };
    } catch (error) {
      throw new Error(`Wallet creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign a transaction using Turnkey
   */
  async signTransaction(
    walletId: string,
    unsignedTransaction: string,
    organizationId: string
  ): Promise<string> {
    try {
      const request: TransactionRequest = {
        type: 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2',
        organizationId,
        parameters: {
          signWith: walletId,
          type: 'TRANSACTION_TYPE_ETHEREUM',
          unsignedTransaction,
        },
        timestampMs: Date.now().toString(),
      };

      const response = await this.apiClient.post('/transactions/sign', request);
      
      return response.data.result.signTransactionResult.signedTransaction;
    } catch (error) {
      throw new Error(`Transaction signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create and sign a staking transaction
   */
  async createStakeTransaction(params: StakeTransactionParams): Promise<{
    signedTransaction: string;
    transactionHash: string;
  }> {
    try {
      // This would typically involve:
      // 1. Building the transaction data for staking
      // 2. Getting gas estimates
      // 3. Signing the transaction
      // 4. Broadcasting to the network

      const stakingContractAddress = params.contractAddress || this.getDefaultStakingContract();
      
      // Build transaction data for staking
      const transactionData = this.buildStakeTransactionData(params.amount, stakingContractAddress);
      
      // Estimate gas
      const gasEstimate = await this.estimateGas(transactionData, params.userAddress);
      
      // Build complete transaction
      const unsignedTransaction = this.buildUnsignedTransaction({
        to: stakingContractAddress,
        value: '0', // Staking doesn't send ETH directly
        data: transactionData,
        gas: gasEstimate.gasLimit,
        gasPrice: gasEstimate.gasPrice,
        nonce: await this.getNonce(params.userAddress),
      });

      // Sign transaction (this would require the actual wallet ID)
      const signedTransaction = await this.signTransaction(
        'wallet_id_placeholder', // This would come from user's wallet
        unsignedTransaction,
        'org_id_placeholder' // This would come from configuration
      );

      // Broadcast transaction
      const transactionHash = await this.broadcastTransaction(signedTransaction);

      return {
        signedTransaction,
        transactionHash,
      };
    } catch (error) {
      throw new Error(`Stake transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create and sign an agent launch transaction
   */
  async createAgentLaunchTransaction(params: AgentLaunchParams): Promise<{
    signedTransaction: string;
    transactionHash: string;
    agentId: string;
  }> {
    try {
      const agentFactoryAddress = this.getAgentFactoryContract();
      
      // Build transaction data for agent launch
      const transactionData = this.buildAgentLaunchTransactionData(
        params.agentName,
        params.agentDescription,
        params.promptTemplate
      );
      
      // Estimate gas
      const gasEstimate = await this.estimateGas(transactionData, params.userAddress);
      
      // Build complete transaction
      const unsignedTransaction = this.buildUnsignedTransaction({
        to: agentFactoryAddress,
        value: params.launchFee,
        data: transactionData,
        gas: gasEstimate.gasLimit,
        gasPrice: gasEstimate.gasPrice,
        nonce: await this.getNonce(params.userAddress),
      });

      // Sign transaction
      const signedTransaction = await this.signTransaction(
        'wallet_id_placeholder',
        unsignedTransaction,
        'org_id_placeholder'
      );

      // Broadcast transaction
      const transactionHash = await this.broadcastTransaction(signedTransaction);

      // Generate agent ID (this would typically come from the contract event)
      const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        signedTransaction,
        transactionHash,
        agentId,
      };
    } catch (error) {
      throw new Error(`Agent launch transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string): Promise<{
    eth: string;
    credits: string;
    stakedAmount: string;
  }> {
    try {
      // This would query the Base RPC for balances
      const baseRpcUrl = import.meta.env.VITE_BASE_RPC_URL;
      
      const rpcClient = axios.create({
        baseURL: baseRpcUrl,
        headers: { 'Content-Type': 'application/json' },
      });

      // Get ETH balance
      const ethBalanceResponse = await rpcClient.post('', {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      });

      // Get credit balance from contract
      const creditBalance = await this.getContractBalance(address, 'credits');
      
      // Get staked amount from contract
      const stakedAmount = await this.getContractBalance(address, 'staked');

      return {
        eth: this.weiToEth(ethBalanceResponse.data.result),
        credits: creditBalance,
        stakedAmount: stakedAmount,
      };
    } catch (error) {
      throw new Error(`Balance query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Estimate gas for a transaction
   */
  private async estimateGas(data: string, from: string): Promise<{
    gasLimit: string;
    gasPrice: string;
  }> {
    // Mock implementation - in production, this would query the Base network
    return {
      gasLimit: '21000',
      gasPrice: '1000000000', // 1 gwei
    };
  }

  /**
   * Get nonce for an address
   */
  private async getNonce(address: string): Promise<string> {
    // Mock implementation - in production, this would query the Base network
    return '0';
  }

  /**
   * Build staking transaction data
   */
  private buildStakeTransactionData(amount: string, contractAddress: string): string {
    // This would encode the contract call for staking
    // Mock implementation
    return `0xa694fc3a${amount.padStart(64, '0')}`;
  }

  /**
   * Build agent launch transaction data
   */
  private buildAgentLaunchTransactionData(
    name: string,
    description: string,
    promptTemplate: string
  ): string {
    // This would encode the contract call for launching an agent
    // Mock implementation
    return `0x12345678${Buffer.from(name).toString('hex').padEnd(64, '0')}`;
  }

  /**
   * Build unsigned transaction object
   */
  private buildUnsignedTransaction(params: {
    to: string;
    value: string;
    data: string;
    gas: string;
    gasPrice: string;
    nonce: string;
  }): string {
    // This would build a proper Ethereum transaction
    // Mock implementation
    return JSON.stringify(params);
  }

  /**
   * Broadcast signed transaction to the network
   */
  private async broadcastTransaction(signedTransaction: string): Promise<string> {
    // Mock implementation - in production, this would broadcast to Base network
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  /**
   * Get contract balance (credits or staked amount)
   */
  private async getContractBalance(address: string, type: 'credits' | 'staked'): Promise<string> {
    // Mock implementation - in production, this would query the contract
    return type === 'credits' ? '100' : '0';
  }

  /**
   * Convert wei to ETH
   */
  private weiToEth(wei: string): string {
    const weiValue = BigInt(wei);
    const ethValue = Number(weiValue) / 1e18;
    return ethValue.toFixed(6);
  }

  /**
   * Get default staking contract address
   */
  private getDefaultStakingContract(): string {
    // This would be configured based on the deployment
    return '0x1234567890123456789012345678901234567890';
  }

  /**
   * Get agent factory contract address
   */
  private getAgentFactoryContract(): string {
    // This would be configured based on the deployment
    return '0x0987654321098765432109876543210987654321';
  }

  /**
   * Validate wallet address format
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format address for display
   */
  formatAddress(address: string): string {
    if (!this.isValidAddress(address)) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const turnkeyService = new TurnkeyService();
export type { 
  WalletCreationResponse, 
  StakeTransactionParams, 
  AgentLaunchParams 
};
