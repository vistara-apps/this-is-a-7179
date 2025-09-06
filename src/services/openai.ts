import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

export interface AgentExecutionRequest {
  agentId: string;
  promptTemplate: string;
  taskDescription: string;
  context?: Record<string, any>;
  maxTokens?: number;
  temperature?: number;
}

export interface AgentExecutionResult {
  success: boolean;
  output: string;
  tokensUsed: number;
  executionTime: number;
  error?: string;
}

export interface AgentOptimizationSuggestion {
  currentPrompt: string;
  suggestedPrompt: string;
  reasoning: string;
  expectedImprovement: string;
}

class OpenAIService {
  private readonly defaultMaxTokens = 1000;
  private readonly defaultTemperature = 0.7;

  /**
   * Execute an AI agent task using OpenAI
   */
  async executeAgent(request: AgentExecutionRequest): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Prepare the prompt by replacing placeholders
      const processedPrompt = this.processPromptTemplate(
        request.promptTemplate, 
        { 
          task: request.taskDescription,
          ...request.context 
        }
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI agent specialized in completing on-chain tasks efficiently and accurately. Provide clear, actionable responses."
          },
          {
            role: "user",
            content: processedPrompt
          }
        ],
        max_tokens: request.maxTokens || this.defaultMaxTokens,
        temperature: request.temperature || this.defaultTemperature,
      });

      const executionTime = Date.now() - startTime;
      const output = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        success: true,
        output,
        tokensUsed,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        output: '',
        tokensUsed: 0,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Optimize an agent's prompt for better performance
   */
  async optimizePrompt(currentPrompt: string, performanceData: {
    successRate: number;
    commonFailures: string[];
    taskTypes: string[];
  }): Promise<AgentOptimizationSuggestion> {
    try {
      const optimizationPrompt = `
        Analyze and improve this AI agent prompt for better performance:
        
        Current Prompt: "${currentPrompt}"
        
        Performance Data:
        - Success Rate: ${performanceData.successRate}%
        - Common Failures: ${performanceData.commonFailures.join(', ')}
        - Task Types: ${performanceData.taskTypes.join(', ')}
        
        Please provide:
        1. An improved version of the prompt
        2. Reasoning for the changes
        3. Expected improvement description
        
        Format your response as JSON with keys: suggestedPrompt, reasoning, expectedImprovement
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in prompt engineering and AI optimization. Provide practical improvements to maximize agent success rates."
          },
          {
            role: "user",
            content: optimizationPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      try {
        const parsed = JSON.parse(response);
        return {
          currentPrompt,
          suggestedPrompt: parsed.suggestedPrompt,
          reasoning: parsed.reasoning,
          expectedImprovement: parsed.expectedImprovement
        };
      } catch {
        // Fallback if JSON parsing fails
        return {
          currentPrompt,
          suggestedPrompt: currentPrompt,
          reasoning: "Unable to generate optimization suggestions at this time.",
          expectedImprovement: "Please try again later."
        };
      }
    } catch (error) {
      throw new Error(`Prompt optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate agent performance insights
   */
  async generatePerformanceInsights(agentData: {
    name: string;
    description: string;
    promptTemplate: string;
    performanceMetrics: {
      successRate: number;
      totalRuns: number;
      avgReward: number;
    };
    recentTasks: string[];
  }): Promise<{
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    marketOpportunities: string[];
  }> {
    try {
      const analysisPrompt = `
        Analyze this AI agent's performance and provide insights:
        
        Agent: ${agentData.name}
        Description: ${agentData.description}
        Prompt Template: ${agentData.promptTemplate}
        
        Performance Metrics:
        - Success Rate: ${agentData.performanceMetrics.successRate}%
        - Total Runs: ${agentData.performanceMetrics.totalRuns}
        - Average Reward: $${agentData.performanceMetrics.avgReward}
        
        Recent Tasks: ${agentData.recentTasks.join(', ')}
        
        Provide analysis in JSON format with keys: strengths, weaknesses, recommendations, marketOpportunities
        Each should be an array of strings with 2-4 items each.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI performance analyst specializing in agent optimization and market analysis for blockchain applications."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        max_tokens: 600,
        temperature: 0.4,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      try {
        const parsed = JSON.parse(response);
        return {
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          recommendations: parsed.recommendations || [],
          marketOpportunities: parsed.marketOpportunities || []
        };
      } catch {
        // Fallback response
        return {
          strengths: ["Consistent performance"],
          weaknesses: ["Limited data for analysis"],
          recommendations: ["Continue monitoring performance"],
          marketOpportunities: ["Explore new task types"]
        };
      }
    } catch (error) {
      throw new Error(`Performance analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate and score a bounty submission
   */
  async validateBountySubmission(
    bountyDescription: string,
    requirements: string,
    submission: string
  ): Promise<{
    score: number; // 0-100
    feedback: string;
    meetsRequirements: boolean;
    suggestions: string[];
  }> {
    try {
      const validationPrompt = `
        Evaluate this bounty submission:
        
        Bounty Description: ${bountyDescription}
        Requirements: ${requirements}
        Submission: ${submission}
        
        Please provide:
        1. A score from 0-100 based on quality and requirement fulfillment
        2. Detailed feedback
        3. Whether it meets the basic requirements (true/false)
        4. Suggestions for improvement (if any)
        
        Format as JSON: {score, feedback, meetsRequirements, suggestions}
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a fair and thorough evaluator of work submissions. Be constructive but maintain high standards."
          },
          {
            role: "user",
            content: validationPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.2,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      try {
        const parsed = JSON.parse(response);
        return {
          score: Math.max(0, Math.min(100, parsed.score || 0)),
          feedback: parsed.feedback || "No feedback available",
          meetsRequirements: Boolean(parsed.meetsRequirements),
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
        };
      } catch {
        return {
          score: 50,
          feedback: "Unable to evaluate submission at this time",
          meetsRequirements: false,
          suggestions: ["Please resubmit for manual review"]
        };
      }
    } catch (error) {
      throw new Error(`Submission validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process prompt template by replacing placeholders
   */
  private processPromptTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
    });
    
    return processed;
  }

  /**
   * Estimate token usage for a prompt
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate estimated cost for a request
   */
  estimateCost(tokens: number, model: string = 'gpt-4'): number {
    // GPT-4 pricing (approximate, as of 2024)
    const pricePerToken = model === 'gpt-4' ? 0.00003 : 0.000002;
    return tokens * pricePerToken;
  }
}

export const openaiService = new OpenAIService();
