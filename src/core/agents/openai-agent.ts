import OpenAI from 'openai';
import { 
  BaseAgent, 
  AgentConfig, 
  AgentRole, 
  Enhancement, 
  AgentCapability,
  AgentType,
  AgentRoleName,
  EnhancementChangeType
} from './index.js';

export interface OpenAIAgentConfig extends AgentConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  organization?: string;
  maxRetries?: number;
  timeout?: number;
}

export class OpenAIAgent extends BaseAgent {
  private client?: OpenAI;
  private model: string;
  private maxRetries: number;
  private requestTimeout: number;

  constructor(name: string = 'openai-agent') {
    const capabilities: AgentCapability[] = [
      {
        name: 'gpt-enhancement',
        description: 'Document enhancement using OpenAI GPT models',
        maxTokens: 16000, // Varies by model, conservative default
        supportedRoles: [
          AgentRoleName.ARCHITECT,
          AgentRoleName.REVIEWER,
          AgentRoleName.OPTIMIZER,
          AgentRoleName.PLANNER
        ]
      }
    ];

    super(name, AgentType.OPENAI, capabilities);
    this.model = 'gpt-4o-mini'; // Default to most cost-effective model
    this.maxRetries = 3;
    this.requestTimeout = 60000; // 60 seconds
  }

  protected async onConfigured(config: AgentConfig): Promise<void> {
    const openaiConfig = config as OpenAIAgentConfig;
    
    this.client = new OpenAI({
      apiKey: openaiConfig.apiKey,
      baseURL: openaiConfig.baseUrl,
      organization: openaiConfig.organization,
      maxRetries: openaiConfig.maxRetries || this.maxRetries,
      timeout: openaiConfig.timeout || this.requestTimeout
    });

    this.model = openaiConfig.model || this.model;
    this.maxRetries = openaiConfig.maxRetries || this.maxRetries;
    this.requestTimeout = openaiConfig.timeout || this.requestTimeout;

    // Test the connection
    await this.testConnection();
  }

  protected async validateSpecificConfig(config: AgentConfig): Promise<boolean> {
    const openaiConfig = config as OpenAIAgentConfig;
    
    if (!openaiConfig.apiKey || openaiConfig.apiKey.trim().length === 0) {
      return false;
    }

    if (openaiConfig.model && !this.isValidModel(openaiConfig.model)) {
      return false;
    }

    if (openaiConfig.maxRetries && (typeof openaiConfig.maxRetries !== 'number' || openaiConfig.maxRetries < 0)) {
      return false;
    }

    if (openaiConfig.timeout && (typeof openaiConfig.timeout !== 'number' || openaiConfig.timeout <= 0)) {
      return false;
    }

    return true;
  }

  protected async performEnhancement(content: string, role: AgentRole): Promise<Enhancement> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const startTime = Date.now();
    const prompt = this.buildEnhancementPrompt(content, role);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: role.systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: role.maxTokens || 2000,
        temperature: role.temperature || 0.3,
        stream: false
      });

      const enhancedContent = response.choices[0]?.message?.content;
      if (!enhancedContent) {
        throw new Error('No response content from OpenAI');
      }

      const changes = this.analyzeChanges(content, enhancedContent, role);
      const processingTime = Date.now() - startTime;

      return {
        originalContent: content,
        enhancedContent,
        changes,
        metadata: {
          ...this.createMetadata(role),
          tokenUsage: {
            prompt: response.usage?.prompt_tokens || 0,
            completion: response.usage?.completion_tokens || 0,
            total: response.usage?.total_tokens || 0
          },
          cost: this.calculateActualCost(response.usage),
          processingTime
        }
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected async calculateCost(content: string, role: AgentRole): Promise<number> {
    const promptTokens = this.estimateTokens(content + role.systemPrompt);
    const completionTokens = role.maxTokens || 2000;
    
    return this.calculateTokenCost(promptTokens, completionTokens);
  }

  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      await this.client.models.list();
    } catch (error) {
      throw new Error(`Failed to connect to OpenAI API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isValidModel(model: string): boolean {
    const validModels = [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ];
    return validModels.includes(model);
  }

  private buildEnhancementPrompt(content: string, role: AgentRole): string {
    return `Please enhance the following document according to your role as a ${role.name}.

Focus on: ${role.description}

Original Document:
---
${content}
---

Please provide an enhanced version that maintains the original structure and intent while applying your expertise. Include specific improvements and explain your reasoning.`;
  }

  private analyzeChanges(original: string, enhanced: string, role: AgentRole) {
    const changes = [];

    if (enhanced.length > original.length * 1.2) {
      changes.push({
        type: EnhancementChangeType.ADDITION,
        section: `${role.name} Enhancement`,
        description: 'Significant content additions',
        confidence: 0.9,
        rationale: 'Enhanced content is substantially longer, indicating additions'
      });
    }

    if (enhanced.length < original.length * 0.8) {
      changes.push({
        type: EnhancementChangeType.DELETION,
        section: `${role.name} Enhancement`,
        description: 'Content reduction and streamlining',
        confidence: 0.8,
        rationale: 'Enhanced content is shorter, indicating removal of redundant content'
      });
    }

    // Always include a modification change if content differs
    if (original !== enhanced) {
      changes.push({
        type: EnhancementChangeType.MODIFICATION,
        section: `${role.name} Review`,
        description: `Applied ${role.description.toLowerCase()}`,
        confidence: 0.9,
        rationale: `Content enhanced according to ${role.name} role specifications`
      });
    }

    return changes;
  }

  private calculateTokenCost(promptTokens: number, completionTokens: number): number {
    // Pricing for gpt-4o-mini (as of 2024)
    const promptCostPer1K = 0.00015;  // $0.150 per 1M tokens
    const completionCostPer1K = 0.0006; // $0.600 per 1M tokens

    const promptCost = (promptTokens / 1000) * promptCostPer1K;
    const completionCost = (completionTokens / 1000) * completionCostPer1K;

    return promptCost + completionCost;
  }

  private calculateActualCost(usage?: OpenAI.CompletionUsage): number {
    if (!usage) return 0;
    return this.calculateTokenCost(usage.prompt_tokens, usage.completion_tokens);
  }

  private estimateTokens(text: string): number {
    // More accurate token estimation for OpenAI models
    // Roughly 0.75 tokens per word, 4 characters per token
    return Math.ceil(text.length / 4);
  }
}

export class OpenAIAgentProvider {
  createAgent(config: AgentConfig): Promise<OpenAIAgent> {
    return Promise.resolve(new OpenAIAgent(config.name));
  }

  validateConfig(config: AgentConfig): boolean {
    const openaiConfig = config as OpenAIAgentConfig;
    return config.type === AgentType.OPENAI && 
           !!config.name && 
           config.name.trim().length > 0 &&
           !!openaiConfig.apiKey &&
           openaiConfig.apiKey.trim().length > 0;
  }

  getRequiredConfigFields(): string[] {
    return ['name', 'type', 'apiKey'];
  }
}