# Phase 1.5: Enhanced MCP Server (Extended Sprint 3 - 3 Days)

> **Sprint Goal**: Build Claude workflow enhancement MCP server with project persistence  
> **Duration**: 3 additional days (Days 16-18)  
> **Status**: 🔄 **PARTIALLY COMPLETE** - Core agent system delivered, MCP server integration pending
> **Success Criteria**: Claude can manage projects end-to-end without drift using MCP tools

## ✅ Sprint 3 Achievements (Completed)
- ✅ **Agent System Foundation**: Complete pluggable architecture implemented
- ✅ **CLI Enhancement**: `mcp enhance` command with 3 agent types operational
- ✅ **Configuration System**: JSON-based agent configuration with environment variables
- ✅ **Built-in Roles**: 4 specialized roles (architect, reviewer, optimizer, planner)
- ✅ **OpenAI Integration**: Full SDK integration with cost tracking

## 🔄 Remaining Integration Tasks (Sprint 4)

### Day 16: Fork Analysis & Extraction
- [ ] **TASK-040**: Deep analysis of claude-code-requirements-builder (4h)
  - Clone and study the repository structure
  - Identify reusable command patterns
  - Document their state management approach
  - Extract useful template structures

- [ ] **TASK-041**: Extract command system architecture (2h)
  ```typescript
  // src/core/commands/
  - Adapt their slash command system
  - Port file-based state management
  - Integrate metadata.json approach
  - Create mcp-specific command variants
  ```

### Day 17: RepoPrompt & Context Generation
- [ ] **TASK-042**: Implement RepoPrompt integration (4h)
  ```typescript
  // src/integrations/repoprompt.ts
  export class RepoPromptIntegration {
    generateManifest(projectPath: string): RepopromptManifest;
    updateOnTemplateChange(templatePath: string): void;
    generateContextForAgent(agent: string): string;
  }
  ```

- [ ] **TASK-043**: Create context generation system (2h)
  - Auto-generate repo context from .mcp/ files
  - Create agent-specific context summaries
  - Export to repoprompt.json format
  - Update on file changes (file watcher)

### Day 18: Enhanced MCP Server for Claude Workflow
- [ ] **TASK-044**: Implement Claude workflow enhancement tools (4h)
  ```typescript
  // Core MCP tools for Claude development workflow
  const claudeWorkflowTools = {
    "mcp_analyze_project": analyzeProjectState,
    "mcp_get_status": getCurrentStatus, 
    "mcp_next_task": getNextPrioritizedTask,
    "mcp_check_drift": checkForDrift,
    "mcp_plan_refinement": runMultiAgentRefinement,
    "mcp_update_progress": updateTaskProgress
  };
  ```

- [ ] **TASK-045**: Implement project state persistence (2h)
  - Persistent project memory across Claude sessions
  - Development state tracking and recovery
  - Multi-session context management
  ```yaml
  # templates/serena.yml
  agents:
    - name: architect
      role: claude
      tools: [read_file, write_file, list_files]
    - name: implementer  
      role: gpt4
      tools: [code_edit, validate, test_run]
    - name: reviewer
      role: gemini
      tools: [analyze_risk, suggest_improvements]
  ```

- [ ] **TASK-046**: Create workflow orchestration (2h)
  - Map mcp-devkit phases to Serena workflows
  - Create playbook templates for common scenarios
  - Add tool interface adapters
  - Test with Serena CLI

## 🔧 Integration Architecture

### MCP Server Implementation

#### Core MCP Tools
```typescript
// MCP tools that mcp-devkit will expose
const mcpTools = {
  // Project management
  "mcp_init": {
    description: "Initialize a new project with mcp-devkit templates",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string" },
        projectType: { type: "string", enum: ["web-app", "api", "cli", "library"] }
      }
    }
  },
  
  // Template operations
  "mcp_validate": {
    description: "Validate project templates and structure",
    inputSchema: {
      type: "object", 
      properties: {
        projectPath: { type: "string" },
        strict: { type: "boolean" }
      }
    }
  },
  
  // Agent enhancement
  "mcp_enhance": {
    description: "Enhance a document using specified AI agent",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string" },
        agent: { type: "string" },
        role: { type: "string" }
      }
    }
  },
  
  // Multi-agent cycle
  "mcp_cycle": {
    description: "Run multi-agent refinement cycle",
    inputSchema: {
      type: "object",
      properties: {
        agents: { type: "array", items: { type: "string" } },
        documents: { type: "array", items: { type: "string" } }
      }
    }
  }
};
```

#### MCP Resources
```typescript
// Resources that can be read via MCP
const mcpResources = {
  // Project context
  "project://context": {
    description: "Current project context and status",
    mimeType: "application/json"
  },
  
  // Templates
  "template://list": {
    description: "Available project templates",
    mimeType: "application/json"
  },
  
  // Validation results
  "validation://report": {
    description: "Latest validation report",
    mimeType: "text/markdown"
  }
};
```

### Dual Interface Architecture
```
mcp-devkit
├── CLI Interface (mcp command)
│   ├── Direct file system access
│   ├── Local template management
│   └── Human-friendly output
│
└── MCP Server Interface
    ├── Tool-based operations
    ├── Resource sharing
    └── AI agent integration
```

### Forked Components from claude-code-requirements-builder

#### Command System
```typescript
// Adapted from their slash commands
interface MCPCommand {
  name: string;
  description: string;
  execute(context: ProjectContext): Promise<void>;
}

// Commands to implement:
// /mcp-init     - Initialize project (replaces /requirements-start)
// /mcp-status   - Show project status (extends /requirements-status)  
// /mcp-refine   - Run multi-agent refinement
// /mcp-validate - Validate templates
// /mcp-export   - Export to other tools
```

#### State Management
```typescript
// Adapted from their .current-requirement approach
interface ProjectState {
  currentProject: string;
  phase: 'planning' | 'refining' | 'implementing';
  lastUpdate: string;
  metadata: {
    agents: AgentConfig[];
    templates: TemplateStatus[];
    integrations: IntegrationStatus[];
  };
}
```

### RepoPrompt Integration Strategy

#### Auto-Generated Manifest
```json
{
  "name": "mcp-managed-project",
  "description": "Project managed with mcp-devkit",
  "context_files": [
    ".mcp/context_prd.md",
    ".mcp/context_architecture.md", 
    ".mcp/context_tasklist.md"
  ],
  "ignore_patterns": [
    ".mcp/archive/**",
    "node_modules/**"
  ],
  "mcp_metadata": {
    "phase": "implementation",
    "agents_configured": ["claude", "gpt4"],
    "last_refinement": "2025-06-29T10:30:00Z"
  }
}
```

#### Context Generation
```typescript
class RepoPromptContextGenerator {
  generateForAgent(agent: Agent): string {
    return `
# Project Context for ${agent.name}

## Current Phase: ${this.project.phase}

## Architecture Overview
${this.loadArchitectureContext()}

## Recent Decisions
${this.loadRecentDecisions()}

## Current Tasks
${this.loadActiveTasks()}

## Agent-Specific Instructions
${this.loadAgentInstructions(agent)}
    `;
  }
}
```

### Serena Integration Strategy

#### Workflow Templates
```yaml
# .mcp/workflows/planning.yml
name: mcp-planning-workflow
description: Multi-agent project planning
steps:
  - name: initial-draft
    agent: claude
    tools: [template_fill, context_read]
    output: draft_prd.md
    
  - name: technical-enhancement  
    agent: gpt4
    input: draft_prd.md
    tools: [technical_analysis, enhancement]
    output: enhanced_prd.md
    
  - name: risk-review
    agent: gemini
    input: enhanced_prd.md
    tools: [risk_analysis, recommendation]
    output: final_prd.md
```

#### Tool Interface Adapters
```typescript
// Bridge mcp-devkit tools to Serena's tool interface
class SerenaToolAdapter {
  wrapMCPTool(tool: MCPTool): SerenaTool {
    return {
      name: tool.name,
      description: tool.description,
      execute: async (params) => {
        const result = await tool.execute(params);
        return this.formatForSerena(result);
      }
    };
  }
}
```

## 📊 Integration Metrics

| Integration | Complexity | Value | Priority |
|-------------|------------|-------|----------|
| claude-code-requirements-builder | High | High | P0 |
| RepoPrompt | Medium | High | P0 |
| Serena | High | Medium | P1 |

## ✅ Integration Success Criteria

### claude-code-requirements-builder Fork
- [ ] Command system successfully ported
- [ ] State management working with .mcp/ structure
- [ ] Template progression logic adapted
- [ ] Maintains backward compatibility with their approach

### RepoPrompt Integration  
- [ ] Auto-generates repoprompt.json on project init
- [ ] Updates manifest when templates change
- [ ] Provides agent-specific context summaries
- [ ] Integrates with file watching system

### Serena Integration
- [ ] Workflow playbooks for mcp-devkit phases
- [ ] Tool interface adapters working
- [ ] Multi-agent orchestration via Serena
- [ ] Compatible with existing Serena installations

## 🚧 Integration Risks

### Technical Risks
- **API Compatibility**: Serena and RepoPrompt APIs may change
- **Complexity**: Three different integration patterns to maintain
- **Performance**: File watching and auto-generation overhead

### Mitigation Strategies
- Pin specific versions of integration targets
- Create adapter pattern for isolation
- Implement lazy loading and caching
- Comprehensive integration tests

## 📝 Integration Documentation

Each integration will require:
- [ ] Setup and configuration guide
- [ ] API reference documentation  
- [ ] Example workflows and use cases
- [ ] Troubleshooting guide
- [ ] Version compatibility matrix

This extended sprint ensures mcp-devkit integrates smoothly with the existing ecosystem while leveraging proven patterns from claude-code-requirements-builder.