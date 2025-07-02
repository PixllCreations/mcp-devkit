import fs from 'fs/promises';
import path from 'path';
import { TemplateManager } from '../../core/templates/manager.js';
import { Logger } from '../../utils/logger.js';

export interface InitToolArgs {
  projectPath?: string;
  projectType?: string;
  requirements?: string;
}

export interface InitToolResult {
  success: boolean;
  message: string;
  projectInitialized: boolean;
  developmentPlan?: {
    phases: Array<{
      name: string;
      duration: string;
      tasks: string[];
    }>;
  };
  nextTask?: {
    id: string;
    description: string;
    estimatedTime: string;
  };
}

class InitTool {
  async execute(args: InitToolArgs): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const { projectPath = process.cwd(), projectType = 'web-app', requirements = '' } = args;
      
      const targetPath = path.resolve(projectPath);
      const mcpPath = path.join(targetPath, '.mcp');
      
      // Check if project already exists
      try {
        await fs.access(mcpPath);
        return {
          content: [{
            type: 'text',
            text: `Project already initialized at ${projectPath}. Use mcp_get_status to check current state.`
          }]
        };
      } catch {
        // Directory doesn't exist, proceed with initialization
      }

      // Create directory if it doesn't exist
      await fs.mkdir(targetPath, { recursive: true });
      
      // Initialize templates
      const logger = new Logger(false);
      const templateManager = new TemplateManager(logger);
      await templateManager.initializeProject(mcpPath, 'default');
      
      // Create development plan based on project type and requirements
      const developmentPlan = this.createDevelopmentPlan(projectType, requirements);
      
      // Update PRD with requirements if provided
      if (requirements) {
        await this.updatePRDWithRequirements(mcpPath, requirements, projectType);
      }
      
      const result: InitToolResult = {
        success: true,
        message: `Project initialized successfully at ${projectPath}`,
        projectInitialized: true,
        developmentPlan,
        nextTask: {
          id: 'define-requirements',
          description: 'Review and complete the Product Requirements Document (PRD)',
          estimatedTime: '30 minutes'
        }
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
      
    } catch (error) {
      const errorResult: InitToolResult = {
        success: false,
        message: `Failed to initialize project: ${error instanceof Error ? error.message : String(error)}`,
        projectInitialized: false
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(errorResult, null, 2)
        }]
      };
    }
  }

  private createDevelopmentPlan(projectType: string, _requirements: string) {
    switch (projectType) {
      case 'saas':
      case 'web-app':
        return {
          phases: [
            {
              name: 'Foundation',
              duration: '1 week',
              tasks: ['Setup framework', 'Database design', 'Authentication system']
            },
            {
              name: 'Core Features',
              duration: '2 weeks',
              tasks: ['Core functionality', 'User interface', 'API development']
            },
            {
              name: 'Business Features',
              duration: '1 week',
              tasks: ['Advanced features', 'Analytics', 'Performance optimization']
            }
          ]
        };
      
      case 'api':
        return {
          phases: [
            {
              name: 'Foundation',
              duration: '3 days',
              tasks: ['API framework setup', 'Database design', 'Authentication']
            },
            {
              name: 'Core Endpoints',
              duration: '1 week',
              tasks: ['CRUD operations', 'Business logic', 'Validation']
            },
            {
              name: 'Production Ready',
              duration: '3 days',
              tasks: ['Documentation', 'Testing', 'Deployment']
            }
          ]
        };
      
      case 'cli':
        return {
          phases: [
            {
              name: 'Foundation',
              duration: '2 days',
              tasks: ['CLI framework', 'Command structure', 'Configuration']
            },
            {
              name: 'Core Commands',
              duration: '5 days',
              tasks: ['Primary commands', 'Error handling', 'User experience']
            },
            {
              name: 'Polish',
              duration: '2 days',
              tasks: ['Testing', 'Documentation', 'Distribution']
            }
          ]
        };
      
      default:
        return {
          phases: [
            {
              name: 'Planning',
              duration: '1 day',
              tasks: ['Requirements analysis', 'Technical design', 'Task breakdown']
            },
            {
              name: 'Implementation',
              duration: '1 week',
              tasks: ['Core functionality', 'Testing', 'Documentation']
            },
            {
              name: 'Deployment',
              duration: '2 days',
              tasks: ['Deployment setup', 'Monitoring', 'Launch preparation']
            }
          ]
        };
    }
  }

  private async updatePRDWithRequirements(mcpPath: string, _requirements: string, projectType: string): Promise<void> {
    const prdPath = path.join(mcpPath, 'context_prd.md');
    
    try {
      let prdContent = await fs.readFile(prdPath, 'utf-8');
      
      // Replace the problem statement placeholder
      prdContent = prdContent.replace(
        'Describe the problem your project solves and why it matters.',
        _requirements
      );
      
      // Add project type context
      prdContent = prdContent.replace(
        'Explain your approach to solving the problem.',
        `Building a ${projectType} to address the requirements: ${_requirements}`
      );
      
      await fs.writeFile(prdPath, prdContent);
    } catch (error) {
      // If we can't update the PRD, that's not critical for initialization
      console.error('Warning: Could not update PRD with requirements:', error);
    }
  }
}

export const initTool = new InitTool();