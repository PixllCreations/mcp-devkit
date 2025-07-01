import { spawn } from 'child_process';
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

export interface ShellAgentConfig extends AgentConfig {
  command: string;
  args?: string[];
  timeout?: number;
  workingDirectory?: string;
  env?: Record<string, string>;
}

export class ShellAgent extends BaseAgent {
  private command?: string;
  private args: string[];
  private timeout: number;
  private workingDirectory: string | undefined;
  private env: Record<string, string> | undefined;

  constructor(name: string = 'shell-agent') {
    const capabilities: AgentCapability[] = [
      {
        name: 'shell-enhancement',
        description: 'Document enhancement via shell command execution',
        maxTokens: 10000, // Shell output can be large
        supportedRoles: [
          AgentRoleName.ARCHITECT,
          AgentRoleName.REVIEWER,
          AgentRoleName.OPTIMIZER,
          AgentRoleName.PLANNER
        ]
      }
    ];

    super(name, AgentType.SHELL, capabilities);
    this.args = [];
    this.timeout = 30000; // 30 second default timeout
  }

  protected async onConfigured(config: AgentConfig): Promise<void> {
    const shellConfig = config as ShellAgentConfig;
    this.command = shellConfig.command;
    this.args = shellConfig.args || [];
    this.timeout = shellConfig.timeout || 30000;
    this.workingDirectory = shellConfig.workingDirectory;
    this.env = shellConfig.env;
  }

  protected async validateSpecificConfig(config: AgentConfig): Promise<boolean> {
    const shellConfig = config as ShellAgentConfig;
    
    if (!shellConfig.command || shellConfig.command.trim().length === 0) {
      return false;
    }

    if (shellConfig.timeout && (typeof shellConfig.timeout !== 'number' || shellConfig.timeout <= 0)) {
      return false;
    }

    if (shellConfig.args && !Array.isArray(shellConfig.args)) {
      return false;
    }

    return true;
  }

  protected async performEnhancement(content: string, role: AgentRole): Promise<Enhancement> {
    if (!this.command) {
      throw new Error('Shell agent not properly configured - missing command');
    }

    const enhancedContent = await this.executeShellCommand(content, role);
    const changes = this.detectChanges(content, enhancedContent);

    return {
      originalContent: content,
      enhancedContent,
      changes,
      metadata: {
        ...this.createMetadata(role),
        tokenUsage: {
          prompt: this.estimateTokens(content),
          completion: this.estimateTokens(enhancedContent),
          total: this.estimateTokens(content + enhancedContent)
        }
      }
    };
  }

  protected async calculateCost(_content: string, _role: AgentRole): Promise<number> {
    // Shell commands are typically free, but might have compute costs
    return 0;
  }

  private async executeShellCommand(content: string, role: AgentRole): Promise<string> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(this.command!, this.args, {
        cwd: this.workingDirectory,
        env: { ...process.env, ...(this.env || {}) },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Set timeout
      const timeoutId = setTimeout(() => {
        childProcess.kill('SIGTERM');
        reject(new Error(`Shell command timed out after ${this.timeout}ms`));
      }, this.timeout);

      childProcess.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      childProcess.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code: number | null) => {
        clearTimeout(timeoutId);
        
        if (code === 0 || code === null) {
          resolve(stdout);
        } else {
          reject(new Error(`Shell command failed with exit code ${code}: ${stderr}`));
        }
      });

      childProcess.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to execute shell command: ${error.message}`));
      });

      // Send content and role information to stdin
      const input = JSON.stringify({
        content,
        role: {
          name: role.name,
          description: role.description,
          systemPrompt: role.systemPrompt
        }
      });

      if (childProcess.stdin) {
        childProcess.stdin.write(input);
        childProcess.stdin.end();
      }
    });
  }

  private detectChanges(original: string, enhanced: string) {
    const changes = [];

    if (original !== enhanced) {
      if (enhanced.length > original.length) {
        changes.push({
          type: EnhancementChangeType.ADDITION,
          section: 'Shell Enhancement',
          description: 'Content enhanced via shell command',
          confidence: 0.8,
          rationale: 'Shell command produced additional content'
        });
      } else if (enhanced.length < original.length) {
        changes.push({
          type: EnhancementChangeType.DELETION,
          section: 'Shell Enhancement',
          description: 'Content reduced via shell command',
          confidence: 0.8,
          rationale: 'Shell command removed some content'
        });
      } else {
        changes.push({
          type: EnhancementChangeType.MODIFICATION,
          section: 'Shell Enhancement',
          description: 'Content modified via shell command',
          confidence: 0.8,
          rationale: 'Shell command changed content structure'
        });
      }
    }

    return changes;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

export class ShellAgentProvider {
  createAgent(config: AgentConfig): Promise<ShellAgent> {
    return Promise.resolve(new ShellAgent(config.name));
  }

  validateConfig(config: AgentConfig): boolean {
    const shellConfig = config as ShellAgentConfig;
    return config.type === AgentType.SHELL && 
           !!config.name && 
           config.name.trim().length > 0 &&
           !!shellConfig.command &&
           shellConfig.command.trim().length > 0;
  }

  getRequiredConfigFields(): string[] {
    return ['name', 'type', 'command'];
  }
}