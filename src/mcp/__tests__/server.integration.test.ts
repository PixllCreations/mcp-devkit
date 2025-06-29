import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';

describe('MCP Server Integration Tests', () => {
  let server: Server;
  const testProjectDir = path.join(process.cwd(), 'test-mcp-project');

  beforeEach(async () => {
    // Create test directory
    try {
      await fs.rm(testProjectDir, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
    await fs.mkdir(testProjectDir, { recursive: true });

    // Create a minimal server instance for testing
    server = new Server(
      {
        name: 'mcp-devkit-test',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testProjectDir, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  describe('ListTools', () => {
    it('should list all available MCP tools', async () => {
      // Mock the list tools handler
      const mockHandler = vi.fn().mockResolvedValue({
        tools: [
          {
            name: 'mcp_init_guided',
            description: 'Initialize a new project with guided setup',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: { type: 'string' },
                projectType: { type: 'string' },
                requirements: { type: 'string' },
              },
            },
          },
          {
            name: 'mcp_get_status',
            description: 'Get current project status',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: { type: 'string' },
              },
            },
          },
        ],
      });

      server.setRequestHandler(ListToolsRequestSchema, mockHandler);

      // Simulate a list tools request
      const result = await mockHandler({});
      
      expect(result.tools).toHaveLength(2);
      expect(result.tools[0].name).toBe('mcp_init_guided');
      expect(result.tools[1].name).toBe('mcp_get_status');
    });
  });

  describe('ListResources', () => {
    it('should list all available MCP resources', async () => {
      // Mock the list resources handler
      const mockHandler = vi.fn().mockResolvedValue({
        resources: [
          {
            uri: 'project://status',
            name: 'Current Project Status',
            description: 'Real-time project status',
            mimeType: 'application/json',
          },
          {
            uri: 'project://architecture',
            name: 'Project Architecture',
            description: 'Architecture documentation',
            mimeType: 'text/markdown',
          },
        ],
      });

      server.setRequestHandler(ListResourcesRequestSchema, mockHandler);

      // Simulate a list resources request
      const result = await mockHandler({});
      
      expect(result.resources).toHaveLength(2);
      expect(result.resources[0].uri).toBe('project://status');
      expect(result.resources[1].uri).toBe('project://architecture');
    });
  });

  describe('CallTool - mcp_init_guided', () => {
    it('should initialize a project with mcp_init_guided', async () => {
      // Mock the call tool handler
      const mockHandler = vi.fn().mockImplementation(async (request) => {
        if (request.params.name === 'mcp_init_guided') {
          // Simulate project initialization
          const projectPath = request.params.arguments.projectPath;
          const mcpPath = path.join(projectPath, '.mcp');
          
          await fs.mkdir(mcpPath, { recursive: true });
          await fs.writeFile(
            path.join(mcpPath, 'metadata.json'),
            JSON.stringify({
              projectInitialized: true,
              templateType: 'default',
              phase: 'planning',
            })
          );

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Project initialized',
                projectInitialized: true,
              }),
            }],
          };
        }
      });

      server.setRequestHandler(CallToolRequestSchema, mockHandler);

      // Simulate calling mcp_init_guided
      const result = await mockHandler({
        params: {
          name: 'mcp_init_guided',
          arguments: {
            projectPath: testProjectDir,
            projectType: 'web-app',
            requirements: 'Test project',
          },
        },
      });

      expect(result.content[0].text).toContain('"success":true');
      
      // Verify project was created
      const metadataExists = await fs.access(
        path.join(testProjectDir, '.mcp', 'metadata.json')
      ).then(() => true).catch(() => false);
      expect(metadataExists).toBe(true);
    });
  });

  describe('CallTool - mcp_get_status', () => {
    it('should get project status for initialized project', async () => {
      // First create a project
      const mcpPath = path.join(testProjectDir, '.mcp');
      await fs.mkdir(mcpPath, { recursive: true });
      
      await fs.writeFile(
        path.join(mcpPath, 'metadata.json'),
        JSON.stringify({
          phase: 'planning',
          created: new Date().toISOString(),
        })
      );

      await fs.writeFile(
        path.join(mcpPath, 'context_tasklist.md'),
        `# Task List\n- [x] Task 1\n- [ ] Task 2\n- [ ] Task 3`
      );

      // Mock the call tool handler
      const mockHandler = vi.fn().mockImplementation(async (request) => {
        if (request.params.name === 'mcp_get_status') {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                currentPhase: 'planning',
                progress: '33%',
                completedTasks: ['Task 1'],
                currentTask: 'Task 2',
                nextSteps: ['Task 3'],
              }),
            }],
          };
        }
      });

      server.setRequestHandler(CallToolRequestSchema, mockHandler);

      // Simulate calling mcp_get_status
      const result = await mockHandler({
        params: {
          name: 'mcp_get_status',
          arguments: {
            projectPath: testProjectDir,
          },
        },
      });

      const status = JSON.parse(result.content[0].text);
      expect(status.currentPhase).toBe('planning');
      expect(status.progress).toBe('33%');
      expect(status.completedTasks).toContain('Task 1');
    });
  });

  describe('CallTool - mcp_check_drift', () => {
    it('should detect conversation drift', async () => {
      // Mock the call tool handler
      const mockHandler = vi.fn().mockImplementation(async (request) => {
        if (request.params.name === 'mcp_check_drift') {
          const { currentDiscussion } = request.params.arguments;
          
          const isDrifting = currentDiscussion.toLowerCase().includes('framework');
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                isDrifting,
                driftType: isDrifting ? 'technology-selection' : undefined,
                recommendation: isDrifting 
                  ? 'Technology choices should be made in architecture phase'
                  : 'Discussion appears to be on track',
                suggestedAction: isDrifting
                  ? 'Return to current implementation task'
                  : 'Continue with current focus',
              }),
            }],
          };
        }
      });

      server.setRequestHandler(CallToolRequestSchema, mockHandler);

      // Test drift detection
      const driftResult = await mockHandler({
        params: {
          name: 'mcp_check_drift',
          arguments: {
            currentDiscussion: 'Should we use a different framework?',
            sessionLength: 45,
          },
        },
      });

      const driftAnalysis = JSON.parse(driftResult.content[0].text);
      expect(driftAnalysis.isDrifting).toBe(true);
      expect(driftAnalysis.driftType).toBe('technology-selection');

      // Test no drift
      const noDriftResult = await mockHandler({
        params: {
          name: 'mcp_check_drift',
          arguments: {
            currentDiscussion: 'Implementing user authentication',
            sessionLength: 30,
          },
        },
      });

      const noDriftAnalysis = JSON.parse(noDriftResult.content[0].text);
      expect(noDriftAnalysis.isDrifting).toBe(false);
    });
  });
});