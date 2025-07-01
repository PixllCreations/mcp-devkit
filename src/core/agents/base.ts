import { 
  Agent, 
  AgentConfig, 
  AgentRole, 
  Enhancement, 
  AgentCapability,
  AgentType,
  EnhancementMetadata
} from './types.js';

export abstract class BaseAgent implements Agent {
  public readonly name: string;
  public readonly type: AgentType;
  public readonly capabilities: AgentCapability[];
  
  protected config?: AgentConfig;
  protected isConfigured = false;

  constructor(name: string, type: AgentType, capabilities: AgentCapability[]) {
    this.name = name;
    this.type = type;
    this.capabilities = capabilities;
  }

  async configure(config: AgentConfig): Promise<void> {
    const isValid = await this.validateConfig(config);
    if (!isValid) {
      throw new Error(`Invalid configuration for agent ${this.name}`);
    }
    
    this.config = config;
    this.isConfigured = true;
    await this.onConfigured(config);
  }

  async enhance(content: string, role: AgentRole): Promise<Enhancement> {
    if (!this.isConfigured || !this.config) {
      throw new Error(`Agent ${this.name} is not configured`);
    }

    if (!this.supportsRole(role)) {
      throw new Error(`Agent ${this.name} does not support role ${role.name}`);
    }

    const startTime = Date.now();
    
    try {
      const enhancement = await this.performEnhancement(content, role);
      const processingTime = Date.now() - startTime;
      
      return {
        ...enhancement,
        metadata: {
          ...enhancement.metadata,
          processingTime
        }
      };
    } catch (error) {
      throw new Error(`Enhancement failed for agent ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateConfig(config: AgentConfig): Promise<boolean> {
    if (!config.type || config.type !== this.type) {
      return false;
    }
    
    if (!config.name || config.name.trim().length === 0) {
      return false;
    }

    return await this.validateSpecificConfig(config);
  }

  async estimateCost(content: string, role: AgentRole): Promise<number> {
    if (!this.isConfigured) {
      throw new Error(`Agent ${this.name} is not configured`);
    }
    
    return await this.calculateCost(content, role);
  }

  protected supportsRole(role: AgentRole): boolean {
    return this.capabilities.some(capability => 
      capability.supportedRoles.includes(role.name)
    );
  }

  protected createMetadata(role: AgentRole): EnhancementMetadata {
    return {
      agent: this.name,
      role: role.name,
      timestamp: new Date().toISOString(),
      processingTime: 0 // Will be set by enhance method
    };
  }

  // Abstract methods to be implemented by concrete agents
  protected abstract onConfigured(config: AgentConfig): Promise<void>;
  protected abstract validateSpecificConfig(config: AgentConfig): Promise<boolean>;
  protected abstract performEnhancement(content: string, role: AgentRole): Promise<Enhancement>;
  protected abstract calculateCost(content: string, role: AgentRole): Promise<number>;
}