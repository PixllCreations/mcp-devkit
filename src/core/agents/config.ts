import { AgentConfig, AgentType, AgentRoleName } from './types.js';

export interface AgentConfigSet {
  agents: Record<string, AgentConfig>;
  defaultAgent?: string;
  roles?: Record<string, Partial<AgentRoleName>>;
}

export const DEFAULT_AGENT_CONFIGS: AgentConfigSet = {
  agents: {
    'mock': {
      type: AgentType.MOCK,
      name: 'mock',
      delay: 1000
    },
    'primary': {
      type: AgentType.OPENAI,
      name: 'primary',
      model: 'gpt-4o-mini',
      apiKey: '${OPENAI_API_KEY}',
      maxTokens: 4000,
      temperature: 0.3
    },
    'architect': {
      type: AgentType.OPENAI,
      name: 'architect',
      model: 'gpt-4o',
      apiKey: '${OPENAI_API_KEY}',
      maxTokens: 6000,
      temperature: 0.2
    },
    'reviewer': {
      type: AgentType.OPENAI,
      name: 'reviewer',
      model: 'gpt-4o-mini',
      apiKey: '${OPENAI_API_KEY}',
      maxTokens: 3000,
      temperature: 0.1
    }
  },
  defaultAgent: 'primary'
};

export class AgentConfigManager {
  private configPath: string;
  private config: AgentConfigSet;

  constructor(configPath: string = '.mcp/agents.json') {
    this.configPath = configPath;
    this.config = DEFAULT_AGENT_CONFIGS;
  }

  /**
   * Load configuration from file
   */
  async loadConfig(): Promise<AgentConfigSet> {
    try {
      const fs = await import('fs/promises');
      const configData = await fs.readFile(this.configPath, 'utf-8');
      const parsedConfig = JSON.parse(configData) as AgentConfigSet;
      
      // Merge with defaults
      this.config = {
        ...DEFAULT_AGENT_CONFIGS,
        ...parsedConfig,
        agents: {
          ...DEFAULT_AGENT_CONFIGS.agents,
          ...parsedConfig.agents
        }
      };
      
      return this.config;
    } catch (error) {
      // File doesn't exist or is invalid, return defaults
      return this.config;
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfig(config?: AgentConfigSet): Promise<void> {
    const configToSave = config || this.config;
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Ensure directory exists
      const dir = path.dirname(this.configPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Save configuration
      await fs.writeFile(
        this.configPath, 
        JSON.stringify(configToSave, null, 2), 
        'utf-8'
      );
      
      this.config = configToSave;
    } catch (error) {
      throw new Error(`Failed to save agent configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get agent configuration by name
   */
  getAgentConfig(name: string): AgentConfig | undefined {
    return this.config.agents[name];
  }

  /**
   * Add or update agent configuration
   */
  setAgentConfig(name: string, config: AgentConfig): void {
    this.config.agents[name] = config;
  }

  /**
   * Remove agent configuration
   */
  removeAgentConfig(name: string): boolean {
    if (this.config.agents[name]) {
      delete this.config.agents[name];
      return true;
    }
    return false;
  }

  /**
   * Get all agent configurations
   */
  getAllAgentConfigs(): Record<string, AgentConfig> {
    return { ...this.config.agents };
  }

  /**
   * Get default agent name
   */
  getDefaultAgent(): string | undefined {
    return this.config.defaultAgent;
  }

  /**
   * Set default agent
   */
  setDefaultAgent(name: string): void {
    if (!this.config.agents[name]) {
      throw new Error(`Agent '${name}' not found in configuration`);
    }
    this.config.defaultAgent = name;
  }

  /**
   * Resolve environment variables in configuration
   */
  resolveEnvironmentVariables(config: AgentConfig): AgentConfig {
    const resolved = { ...config };
    
    // Resolve API key from environment
    if (resolved.apiKey && resolved.apiKey.startsWith('${') && resolved.apiKey.endsWith('}')) {
      const envVar = resolved.apiKey.slice(2, -1);
      resolved.apiKey = process.env[envVar] || resolved.apiKey;
    }
    
    // Resolve other string fields
    Object.keys(resolved).forEach(key => {
      const value = resolved[key];
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const envVar = value.slice(2, -1);
        resolved[key] = process.env[envVar] || value;
      }
    });
    
    return resolved;
  }

  /**
   * Validate all configurations
   */
  validateConfigurations(): string[] {
    const errors: string[] = [];
    
    Object.entries(this.config.agents).forEach(([name, config]) => {
      if (!config.type) {
        errors.push(`Agent '${name}' missing required field: type`);
      }
      
      if (!config.name) {
        errors.push(`Agent '${name}' missing required field: name`);
      }
      
      if (config.type === AgentType.OPENAI && !config.apiKey) {
        errors.push(`OpenAI agent '${name}' missing required field: apiKey`);
      }
      
      if (config.type === AgentType.SHELL && !(config as any).command) {
        errors.push(`Shell agent '${name}' missing required field: command`);
      }
    });
    
    return errors;
  }

  /**
   * Create example configuration file
   */
  static createExampleConfig(): AgentConfigSet {
    return {
      agents: {
        'mock-demo': {
          type: AgentType.MOCK,
          name: 'mock-demo',
          delay: 2000
        },
        'gpt4-architect': {
          type: AgentType.OPENAI,
          name: 'gpt4-architect',
          model: 'gpt-4o',
          apiKey: '${OPENAI_API_KEY}',
          maxTokens: 6000,
          temperature: 0.2
        },
        'gpt4-mini-reviewer': {
          type: AgentType.OPENAI,
          name: 'gpt4-mini-reviewer', 
          model: 'gpt-4o-mini',
          apiKey: '${OPENAI_API_KEY}',
          maxTokens: 3000,
          temperature: 0.1
        },
        'local-formatter': {
          type: AgentType.SHELL,
          name: 'local-formatter',
          command: 'prettier',
          args: ['--parser', 'markdown'],
          timeout: 10000
        }
      },
      defaultAgent: 'gpt4-mini-reviewer'
    };
  }
}