import fs from 'fs/promises';
import path from 'path';

export interface StatusToolArgs {
  projectPath?: string;
}

export interface StatusResult {
  currentPhase: string;
  progress: string;
  completedTasks: string[];
  currentTask?: string;
  nextSteps: string[];
  blockers: string[];
  estimatedTimeToPhaseCompletion?: string;
}

export interface NextTaskArgs {
  projectPath?: string;
}

export interface DriftCheckArgs {
  currentDiscussion: string;
  sessionLength?: number;
}

export interface DriftCheckResult {
  isDrifting: boolean;
  driftType?: string;
  originalPlan?: string;
  currentFocus: string;
  recommendation: string;
  suggestedAction: string;
}

class StatusTool {
  async execute(args: StatusToolArgs): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const projectPath = args.projectPath || '.';
      const mcpPath = path.join(path.resolve(projectPath), '.mcp');
      
      // Check if project exists
      try {
        await fs.access(mcpPath);
      } catch {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'No mcp-devkit project found. Run mcp_init_guided first.',
              projectExists: false
            }, null, 2)
          }]
        };
      }

      const status = await this.analyzeProjectStatus(mcpPath);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(status, null, 2)
        }]
      };
      
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Failed to get project status: ${error instanceof Error ? error.message : String(error)}`,
            success: false
          }, null, 2)
        }]
      };
    }
  }

  async getNextTask(args: NextTaskArgs): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const projectPath = args.projectPath || '.';
      const mcpPath = path.join(path.resolve(projectPath), '.mcp');
      
      const nextTask = await this.identifyNextTask(mcpPath);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(nextTask, null, 2)
        }]
      };
      
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Failed to get next task: ${error instanceof Error ? error.message : String(error)}`,
            success: false
          }, null, 2)
        }]
      };
    }
  }

  async checkDrift(args: DriftCheckArgs): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const driftAnalysis = await this.analyzeDrift(args);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(driftAnalysis, null, 2)
        }]
      };
      
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Failed to check drift: ${error instanceof Error ? error.message : String(error)}`,
            success: false
          }, null, 2)
        }]
      };
    }
  }

  private async analyzeProjectStatus(mcpPath: string): Promise<StatusResult> {
    // Read metadata to understand project state
    const metadataPath = path.join(mcpPath, 'metadata.json');
    let metadata: any = {};
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(metadataContent);
    } catch {
      // If no metadata, assume early stage
    }

    // Analyze task list to determine progress
    const taskListPath = path.join(mcpPath, 'context_tasklist.md');
    let completedTasks: string[] = [];
    let currentTask: string | undefined;
    let nextSteps: string[] = [];
    
    try {
      const taskContent = await fs.readFile(taskListPath, 'utf-8');
      
      // Parse completed tasks (lines with [x])
      const completedMatches = taskContent.match(/- \[x\] (.+)/g);
      if (completedMatches) {
        completedTasks = completedMatches.map(match => match.replace(/- \[x\] /, ''));
      }
      
      // Find current task (first uncompleted task)
      const pendingMatches = taskContent.match(/- \[ \] (.+)/g);
      if (pendingMatches && pendingMatches.length > 0) {
        currentTask = pendingMatches[0].replace(/- \[ \] /, '');
        nextSteps = pendingMatches.slice(1, 4).map(match => match.replace(/- \[ \] /, ''));
      }
      
    } catch {
      // If no task list, provide default guidance
      nextSteps = [
        'Complete the Product Requirements Document (PRD)',
        'Define technical architecture',
        'Break down development tasks'
      ];
    }

    // Calculate progress
    const totalTasks = completedTasks.length + (currentTask ? 1 : 0) + nextSteps.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    return {
      currentPhase: metadata.phase || 'planning',
      progress: `${progressPercentage}%`,
      completedTasks,
      currentTask,
      nextSteps,
      blockers: [], // TODO: implement blocker detection
      estimatedTimeToPhaseCompletion: this.estimateTimeToCompletion(nextSteps.length)
    };
  }

  private async identifyNextTask(mcpPath: string): Promise<any> {
    const status = await this.analyzeProjectStatus(mcpPath);
    
    if (status.currentTask) {
      return {
        task: status.currentTask,
        priority: 'high',
        estimatedTime: '30-60 minutes',
        context: 'Continue with current development task',
        nextSteps: status.nextSteps.slice(0, 2)
      };
    }

    // If no current task, suggest next logical step based on phase
    const phase = status.currentPhase;
    
    switch (phase) {
      case 'planning':
        return {
          task: 'Complete Product Requirements Document',
          priority: 'high',
          estimatedTime: '1-2 hours',
          context: 'Define project scope and requirements before implementation',
          nextSteps: ['Define technical architecture', 'Create development task breakdown']
        };
      
      case 'refining':
        return {
          task: 'Run multi-agent refinement cycle',
          priority: 'high',
          estimatedTime: '30-60 minutes',
          context: 'Get expert feedback on current plans',
          nextSteps: ['Address feedback', 'Finalize architecture']
        };
      
      default:
        return {
          task: 'Review project status and update task list',
          priority: 'medium',
          estimatedTime: '15-30 minutes',
          context: 'Organize next development steps',
          nextSteps: status.nextSteps
        };
    }
  }

  private async analyzeDrift(args: DriftCheckArgs): Promise<DriftCheckResult> {
    const { currentDiscussion, sessionLength = 0 } = args;
    
    // Simple drift detection heuristics
    const driftKeywords = [
      'should we consider', 'what about', 'maybe we could',
      'alternative approach', 'different framework', 'refactor',
      'optimization', 'perfect solution', 'scalability'
    ];
    
    const isDrifting = driftKeywords.some(keyword => 
      currentDiscussion.toLowerCase().includes(keyword)
    ) || sessionLength > 90; // Long sessions tend to drift

    let driftType = '';
    let recommendation = '';
    let suggestedAction = '';

    if (isDrifting) {
      if (currentDiscussion.toLowerCase().includes('framework') || 
          currentDiscussion.toLowerCase().includes('technology')) {
        driftType = 'technology-selection';
        recommendation = 'Technology choices should be made in architecture phase, not during implementation';
        suggestedAction = 'Return to current implementation task. Document technology questions for later review';
      } else if (currentDiscussion.toLowerCase().includes('optimization') || 
                 currentDiscussion.toLowerCase().includes('performance')) {
        driftType = 'premature-optimization';
        recommendation = 'Focus on core functionality first. Optimization comes later';
        suggestedAction = 'Complete current feature implementation. Add optimization to backlog';
      } else if (sessionLength > 90) {
        driftType = 'session-length';
        recommendation = 'Long sessions tend to lose focus and effectiveness';
        suggestedAction = 'Consider taking a break or wrapping up current task';
      } else {
        driftType = 'over-architecture';
        recommendation = 'Stay focused on current development goals';
        suggestedAction = 'Return to the specific task at hand';
      }
    } else {
      recommendation = 'Discussion appears to be on track with development goals';
      suggestedAction = 'Continue with current focus';
    }

    return {
      isDrifting,
      driftType: isDrifting ? driftType : undefined,
      originalPlan: 'Focus on systematic implementation according to development plan',
      currentFocus: currentDiscussion,
      recommendation,
      suggestedAction
    };
  }

  private estimateTimeToCompletion(remainingTasks: number): string {
    if (remainingTasks === 0) return '0 hours';
    if (remainingTasks <= 2) return '2-4 hours';
    if (remainingTasks <= 5) return '1-2 days';
    return '3-5 days';
  }
}

export const statusTool = new StatusTool();