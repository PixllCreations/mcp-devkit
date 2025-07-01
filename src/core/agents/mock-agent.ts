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

export class MockAgent extends BaseAgent {
  private delay: number;
  private enhancementTemplates: Map<AgentRoleName, string>;

  constructor(name: string = 'mock-agent') {
    const capabilities: AgentCapability[] = [
      {
        name: 'mock-enhancement',
        description: 'Simulated document enhancement for testing',
        maxTokens: 4000,
        supportedRoles: [
          AgentRoleName.ARCHITECT,
          AgentRoleName.REVIEWER, 
          AgentRoleName.OPTIMIZER,
          AgentRoleName.PLANNER
        ]
      }
    ];

    super(name, AgentType.MOCK, capabilities);
    this.delay = 1000; // Default 1 second delay
    this.enhancementTemplates = this.createEnhancementTemplates();
  }

  protected async onConfigured(config: AgentConfig): Promise<void> {
    this.delay = (config as any)['delay'] || 1000;
  }

  protected async validateSpecificConfig(config: AgentConfig): Promise<boolean> {
    // Mock agent has minimal config requirements
    if ((config as any)['delay'] && (typeof (config as any)['delay'] !== 'number' || (config as any)['delay'] < 0)) {
      return false;
    }
    return true;
  }

  protected async performEnhancement(content: string, role: AgentRole): Promise<Enhancement> {
    // Simulate API delay
    await this.simulateDelay();

    const template = this.enhancementTemplates.get(role.name);
    if (!template) {
      throw new Error(`No enhancement template for role: ${role.name}`);
    }

    const enhancedContent = this.applyEnhancementTemplate(content, template, role);
    const changes = this.generateMockChanges(content, enhancedContent, role);

    return {
      originalContent: content,
      enhancedContent,
      changes,
      metadata: {
        ...this.createMetadata(role),
        tokenUsage: {
          prompt: this.estimateTokens(content + role.systemPrompt),
          completion: this.estimateTokens(enhancedContent),
          total: this.estimateTokens(content + role.systemPrompt + enhancedContent)
        },
        cost: 0.001 // Mock cost
      }
    };
  }

  protected async calculateCost(content: string, role: AgentRole): Promise<number> {
    const tokens = this.estimateTokens(content + role.systemPrompt);
    return tokens * 0.000001; // Mock pricing: $0.000001 per token
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  private createEnhancementTemplates(): Map<AgentRoleName, string> {
    return new Map([
      [AgentRoleName.ARCHITECT, `
## Architecture Improvements

### System Design
- Enhanced modular architecture with clear separation of concerns
- Improved abstraction layers for better maintainability
- Added design patterns for scalability

### Technical Recommendations
- Consider implementing dependency injection for better testability
- Add caching layer for improved performance
- Implement proper error handling and logging strategies

{original_content}

---
*Enhanced by Mock Architect Agent*`],

      [AgentRoleName.REVIEWER, `
## Code Review Feedback

### Strengths
- Clean code structure and readable implementation
- Good use of TypeScript features for type safety
- Proper separation of concerns

### Improvements
- Add comprehensive error handling
- Increase test coverage for edge cases
- Consider performance optimizations
- Add JSDoc documentation for public APIs

{original_content}

---
*Reviewed by Mock Code Reviewer*`],

      [AgentRoleName.OPTIMIZER, `
## Performance Optimizations

### Identified Bottlenecks
- Function calls that could be memoized
- Potential memory leaks in event handlers
- Inefficient data structures usage

### Optimization Recommendations
- Implement lazy loading for large datasets
- Add connection pooling for external services
- Use more efficient algorithms for data processing
- Consider worker threads for CPU-intensive tasks

{original_content}

---
*Optimized by Mock Performance Agent*`],

      [AgentRoleName.PLANNER, `
## Enhanced Project Plan

### Task Breakdown
- **Phase 1**: Foundation setup and core architecture
- **Phase 2**: Feature implementation and testing
- **Phase 3**: Integration and deployment

### Risk Mitigation
- Identified potential blockers and dependencies
- Added buffer time for unforeseen issues
- Established rollback procedures

### Success Metrics
- Performance benchmarks defined
- Quality gates established
- User acceptance criteria clarified

{original_content}

---
*Planned by Mock Project Manager*`]
    ]);
  }

  private applyEnhancementTemplate(content: string, template: string, _role: AgentRole): string {
    return template.replace('{original_content}', content);
  }

  private generateMockChanges(_original: string, _enhanced: string, role: AgentRole) {
    return [
      {
        type: EnhancementChangeType.ADDITION,
        section: `${role.name} Enhancement`,
        description: `Added ${role.description.toLowerCase()}`,
        confidence: 0.9,
        rationale: `Mock agent simulation for ${role.name} role`
      },
      {
        type: EnhancementChangeType.MODIFICATION,
        section: 'Content Structure',
        description: 'Improved document structure and formatting',
        confidence: 0.8,
        rationale: 'Enhanced readability and organization'
      }
    ];
  }

  private estimateTokens(text: string): number {
    // Rough token estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

export class MockAgentProvider {
  createAgent(config: AgentConfig): Promise<MockAgent> {
    return Promise.resolve(new MockAgent(config.name));
  }

  validateConfig(config: AgentConfig): boolean {
    return config.type === AgentType.MOCK && 
           !!config.name && 
           config.name.trim().length > 0;
  }

  getRequiredConfigFields(): string[] {
    return ['name', 'type'];
  }
}