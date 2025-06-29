import fs from 'fs/promises';
import path from 'path';

export interface ResourceReadResult {
  contents: Array<{
    type: string;
    text?: string;
    data?: string;
    uri?: string;
  }>;
}

class ProjectResource {
  async read(uri: string): Promise<ResourceReadResult> {
    try {
      const [, resourceType] = uri.split('://');
      
      switch (resourceType) {
        case 'status':
          return await this.readStatus();
        
        case 'architecture':
          return await this.readArchitecture();
        
        case 'tasks':
          return await this.readTasks();
        
        default:
          throw new Error(`Unknown resource type: ${resourceType}`);
      }
      
    } catch (error) {
      return {
        contents: [{
          type: 'text',
          text: `Error reading resource: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  private async readStatus(): Promise<ResourceReadResult> {
    try {
      const mcpPath = this.findMcpDirectory();
      if (!mcpPath) {
        return {
          contents: [{
            type: 'text',
            text: 'No mcp-devkit project found in current directory or parent directories'
          }]
        };
      }

      const metadataPath = path.join(mcpPath, 'metadata.json');
      let status = { phase: 'unknown', created: 'unknown' };
      
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        status = JSON.parse(metadataContent);
      } catch {
        // Metadata not found or invalid
      }

      return {
        contents: [{
          type: 'text',
          text: JSON.stringify({
            projectFound: true,
            phase: status.phase,
            created: status.created,
            lastModified: new Date().toISOString(),
            mcpPath
          }, null, 2)
        }]
      };
      
    } catch (error) {
      return {
        contents: [{
          type: 'text',
          text: `Error reading project status: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  private async readArchitecture(): Promise<ResourceReadResult> {
    try {
      const mcpPath = this.findMcpDirectory();
      if (!mcpPath) {
        return {
          contents: [{
            type: 'text',
            text: 'No mcp-devkit project found'
          }]
        };
      }

      const archPath = path.join(mcpPath, 'context_architecture.md');
      const content = await fs.readFile(archPath, 'utf-8');
      
      return {
        contents: [{
          type: 'text',
          text: content
        }]
      };
      
    } catch (error) {
      return {
        contents: [{
          type: 'text',
          text: `Architecture document not found or could not be read: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  private async readTasks(): Promise<ResourceReadResult> {
    try {
      const mcpPath = this.findMcpDirectory();
      if (!mcpPath) {
        return {
          contents: [{
            type: 'text',
            text: 'No mcp-devkit project found'
          }]
        };
      }

      const tasksPath = path.join(mcpPath, 'context_tasklist.md');
      const content = await fs.readFile(tasksPath, 'utf-8');
      
      return {
        contents: [{
          type: 'text',
          text: content
        }]
      };
      
    } catch (error) {
      return {
        contents: [{
          type: 'text',
          text: `Task list not found or could not be read: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  private findMcpDirectory(): string | null {
    let currentDir = process.cwd();
    
    while (currentDir !== path.dirname(currentDir)) {
      const mcpPath = path.join(currentDir, '.mcp');
      
      try {
        // Check if .mcp directory exists synchronously
        require('fs').accessSync(mcpPath);
        return mcpPath;
      } catch {
        // Directory doesn't exist, try parent
        currentDir = path.dirname(currentDir);
      }
    }
    
    return null;
  }
}

export const projectResource = new ProjectResource();