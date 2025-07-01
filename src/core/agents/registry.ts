import { Agent, AgentConfig, AgentProvider, AgentType } from './types.js';

export class AgentRegistry {
  private providers = new Map<AgentType, AgentProvider>();
  private agents = new Map<string, Agent>();

  /**
   * Register an agent provider for a specific type
   */
  registerProvider(type: AgentType, provider: AgentProvider): void {
    this.providers.set(type, provider);
  }

  /**
   * Create and register an agent instance
   */
  async createAgent(config: AgentConfig): Promise<Agent> {
    const provider = this.providers.get(config.type);
    if (!provider) {
      throw new Error(`No provider registered for agent type: ${config.type}`);
    }

    if (!provider.validateConfig(config)) {
      const requiredFields = provider.getRequiredConfigFields();
      throw new Error(`Invalid configuration for ${config.type}. Required fields: ${requiredFields.join(', ')}`);
    }

    const agent = await provider.createAgent(config);
    await agent.configure(config);
    
    this.agents.set(config.name, agent);
    return agent;
  }

  /**
   * Get an agent by name
   */
  getAgent(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: AgentType): Agent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  /**
   * Remove an agent
   */
  removeAgent(name: string): boolean {
    return this.agents.delete(name);
  }

  /**
   * Check if an agent exists
   */
  hasAgent(name: string): boolean {
    return this.agents.has(name);
  }

  /**
   * Get all registered provider types
   */
  getRegisteredTypes(): AgentType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Clear all agents (keeps providers)
   */
  clearAgents(): void {
    this.agents.clear();
  }

  /**
   * Clear all providers and agents
   */
  clearAll(): void {
    this.providers.clear();
    this.agents.clear();
  }

  /**
   * Get configuration requirements for a specific agent type
   */
  getConfigRequirements(type: AgentType): string[] {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`No provider registered for agent type: ${type}`);
    }
    return provider.getRequiredConfigFields();
  }

  /**
   * Validate configuration for a specific agent type
   */
  validateConfig(config: AgentConfig): boolean {
    const provider = this.providers.get(config.type);
    if (!provider) {
      return false;
    }
    return provider.validateConfig(config);
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry();