#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { initTool } from './tools/init.js';
import { statusTool } from './tools/status.js';
import { projectResource } from './resources/project.js';

// Create the MCP server
const server = new Server(
  {
    name: 'mcp-devkit',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'mcp_init_guided',
        description: 'Initialize a new project with guided setup and structured development plan',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path where the project should be initialized',
            },
            projectType: {
              type: 'string',
              description: 'Type of project (web-app, api, cli, library)',
              enum: ['web-app', 'api', 'cli', 'library', 'saas'],
            },
            requirements: {
              type: 'string',
              description: 'Brief description of project requirements',
            },
          },
          required: ['projectPath'],
        },
      },
      {
        name: 'mcp_get_status',
        description: 'Get current project status, progress, and next steps',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project directory',
              default: '.',
            },
          },
        },
      },
      {
        name: 'mcp_next_task',
        description: 'Get the next prioritized task to work on',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project directory',
              default: '.',
            },
          },
        },
      },
      {
        name: 'mcp_check_drift',
        description: 'Check if current conversation is drifting from the development plan',
        inputSchema: {
          type: 'object',
          properties: {
            currentDiscussion: {
              type: 'string',
              description: 'Summary of current conversation topic',
            },
            sessionLength: {
              type: 'number',
              description: 'Length of current session in minutes',
            },
          },
          required: ['currentDiscussion'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'mcp_init_guided':
      return await initTool.execute(args);
    
    case 'mcp_get_status':
      return await statusTool.execute(args);
    
    case 'mcp_next_task':
      return await statusTool.getNextTask(args);
    
    case 'mcp_check_drift':
      return await statusTool.checkDrift(args);
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'project://status',
        name: 'Current Project Status',
        description: 'Real-time project status and progress information',
        mimeType: 'application/json',
      },
      {
        uri: 'project://architecture',
        name: 'Project Architecture',
        description: 'Current project architecture and technical decisions',
        mimeType: 'text/markdown',
      },
      {
        uri: 'project://tasks',
        name: 'Task List',
        description: 'Current development tasks and progress',
        mimeType: 'text/markdown',
      },
    ],
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  return await projectResource.read(uri);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log startup (stderr so it doesn't interfere with MCP protocol)
  console.error('mcp-devkit MCP server running');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});