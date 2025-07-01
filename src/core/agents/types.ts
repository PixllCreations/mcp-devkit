export enum AgentType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  MOCK = 'mock',
  SHELL = 'shell'
}

export enum EnhancementChangeType {
  ADDITION = 'addition',
  MODIFICATION = 'modification',
  DELETION = 'deletion',
  RESTRUCTURE = 'restructure'
}

export enum AgentRoleName {
  ARCHITECT = 'architect',
  REVIEWER = 'reviewer',
  OPTIMIZER = 'optimizer',
  PLANNER = 'planner'
}

export interface AgentConfig {
  type: AgentType;
  name: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
  [key: string]: unknown;
}

export interface AgentRole {
  name: AgentRoleName;
  description: string;
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface Enhancement {
  originalContent: string;
  enhancedContent: string;
  changes: EnhancementChange[];
  metadata: EnhancementMetadata;
}

export interface EnhancementChange {
  type: EnhancementChangeType;
  section: string;
  description: string;
  confidence: number; // 0-1 scale
  rationale: string;
}

export interface EnhancementMetadata {
  agent: string;
  role: AgentRoleName;
  timestamp: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
  processingTime: number;
}

export interface Agent {
  readonly name: string;
  readonly type: AgentType;
  readonly capabilities: AgentCapability[];
  
  configure(config: AgentConfig): Promise<void>;
  enhance(content: string, role: AgentRole): Promise<Enhancement>;
  validateConfig(config: AgentConfig): Promise<boolean>;
  estimateCost(content: string, role: AgentRole): Promise<number>;
}

export interface AgentCapability {
  name: string;
  description: string;
  maxTokens: number;
  supportedRoles: AgentRoleName[];
}

export interface AgentProvider {
  createAgent(config: AgentConfig): Promise<Agent>;
  validateConfig(config: AgentConfig): boolean;
  getRequiredConfigFields(): string[];
}

// Built-in agent roles
export const BUILT_IN_ROLES: Record<AgentRoleName, AgentRole> = {
  [AgentRoleName.ARCHITECT]: {
    name: AgentRoleName.ARCHITECT,
    description: 'High-level system design and architectural improvements',
    systemPrompt: `You are a software architect reviewing project documentation. 
    Focus on:
    - System design and architecture
    - Technology choices and trade-offs
    - Scalability and maintainability
    - Integration patterns
    - Performance considerations
    
    Provide specific, actionable improvements while maintaining the document's original intent.`,
    maxTokens: 2000,
    temperature: 0.3
  },
  
  [AgentRoleName.REVIEWER]: {
    name: AgentRoleName.REVIEWER,
    description: 'Code review and quality assessment',
    systemPrompt: `You are a senior developer conducting a thorough code review.
    Focus on:
    - Code quality and best practices
    - Security vulnerabilities
    - Performance issues
    - Testing coverage
    - Documentation completeness
    
    Provide constructive feedback with specific suggestions for improvement.`,
    maxTokens: 1500,
    temperature: 0.2
  },
  
  [AgentRoleName.OPTIMIZER]: {
    name: AgentRoleName.OPTIMIZER,
    description: 'Performance and efficiency improvements',
    systemPrompt: `You are a performance optimization specialist.
    Focus on:
    - Algorithm efficiency
    - Resource utilization
    - Bottleneck identification
    - Caching strategies
    - Memory management
    
    Suggest specific optimizations with measurable impact.`,
    maxTokens: 1500,
    temperature: 0.1
  },
  
  [AgentRoleName.PLANNER]: {
    name: AgentRoleName.PLANNER,
    description: 'Project planning and task breakdown',
    systemPrompt: `You are a project manager and technical lead.
    Focus on:
    - Task breakdown and estimation
    - Risk identification
    - Timeline planning
    - Resource allocation
    - Milestone definition
    
    Create actionable plans with clear deliverables and success criteria.`,
    maxTokens: 2500,
    temperature: 0.4
  }
};