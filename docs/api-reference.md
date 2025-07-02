# API Reference

## MCP Tools

These tools are available to Claude when the MCP server is running.

### `mcp_init_guided`

Initialize a new project with AI-guided planning and setup.

**Parameters:**
```typescript
interface InitToolArgs {
  directory: string;          // Target directory path
  projectName?: string;       // Project name (optional)
  description?: string;       // Project description (optional)  
  template?: string;          // Template type (default: "default")
  force?: boolean;           // Overwrite existing .mcp directory
}
```

**Returns:**
```typescript
interface InitResult {
  success: boolean;
  projectPath: string;
  templateUsed: string;
  filesCreated: string[];
  message: string;
}
```

**Example:**
```typescript
// Initialize new web app project
await mcp_init_guided({
  directory: "./my-web-app",
  projectName: "My Web App", 
  description: "A modern React web application",
  template: "web-app"
});
```

### `mcp_get_status`

Get current project status, progress, and next recommended actions.

**Parameters:**
```typescript
interface StatusToolArgs {
  detailed?: boolean;        // Include detailed analysis
  includeFiles?: boolean;    // Include file-level status
}
```

**Returns:**
```typescript
interface StatusResult {
  currentPhase: string;
  progress: string;
  completedTasks: string[];
  currentTask: string;
  nextSteps: string[];
  blockers: string[];
  estimatedTimeToPhaseCompletion: string;
}
```

**Example:**
```typescript
// Get project status
const status = await mcp_get_status({ detailed: true });
console.log(`Current phase: ${status.currentPhase}`);
console.log(`Progress: ${status.progress}`);
```

### `mcp_next_task`

Get the next prioritized task to work on based on project state.

**Parameters:**
```typescript
interface NextTaskArgs {
  category?: 'implementation' | 'testing' | 'documentation' | 'deployment';
  priority?: 'high' | 'medium' | 'low';
  timeAvailable?: number;    // Minutes available
}
```

**Returns:**
```typescript
interface NextTaskResult {
  task: {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    estimatedTime: number;
    dependencies: string[];
    acceptance_criteria: string[];
  };
  context: string;
  reasoning: string;
}
```

### `mcp_check_drift`

Check if current work is drifting from the original plan and get recommendations.

**Parameters:**
```typescript
interface DriftCheckArgs {
  currentFocus?: string;     // What you're currently working on
  context?: string;          // Additional context
}
```

**Returns:**
```typescript
interface DriftCheckResult {
  isDrifting: boolean;
  driftType: string;         // 'scope', 'architecture', 'priority', 'none'
  originalPlan: string;
  currentFocus: string;
  recommendation: string;
  suggestedAction: string;
}
```

### `mcp_analyze_project`

Analyze existing codebase for recovery or enhancement opportunities.

**Parameters:**
```typescript
interface AnalyzeProjectArgs {
  path?: string;             // Project path (default: current directory)
  deep?: boolean;           // Perform deep analysis
  includeMetrics?: boolean; // Include code metrics
}
```

**Returns:**
```typescript
interface AnalyzeProjectResult {
  projectType: string;
  technologies: string[];
  structure: {
    directories: string[];
    keyFiles: string[];
    testCoverage?: number;
  };
  health: {
    score: number;
    issues: Array<{
      type: string;
      severity: string;
      message: string;
      file?: string;
    }>;
  };
  recommendations: string[];
  recoveryPlan?: {
    phase: string;
    tasks: string[];
    estimatedEffort: string;
  };
}
```

### `mcp_plan_refinement`

Run multi-agent planning cycle for enhanced project planning.

**Parameters:**
```typescript
interface PlanRefinementArgs {
  agents?: string[];         // Which agents to use
  focus?: string;           // Specific area to focus on
  iterations?: number;      // Number of refinement cycles
}
```

**Returns:**
```typescript
interface PlanRefinementResult {
  originalPlan: string;
  refinedPlan: string;
  agentContributions: Array<{
    agent: string;
    role: string;
    feedback: string;
    suggestions: string[];
  }>;
  consensusPoints: string[];
  conflictResolutions: string[];
  finalRecommendations: string[];
}
```

### `mcp_technical_review`

Get expert technical consultation on specific aspects of the project.

**Parameters:**
```typescript
interface TechnicalReviewArgs {
  focus: 'architecture' | 'performance' | 'security' | 'testing' | 'deployment';
  files?: string[];         // Specific files to review
  questions?: string[];     // Specific questions to address
}
```

**Returns:**
```typescript
interface TechnicalReviewResult {
  reviewType: string;
  findings: Array<{
    category: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    description: string;
    location?: string;
    recommendation: string;
  }>;
  summary: string;
  actionItems: Array<{
    priority: string;
    task: string;
    estimatedEffort: string;
  }>;
  expertInsights: string[];
}
```

## CLI Commands

### `mcp-devkit init [directory]`

Initialize a new project with mcp-devkit structure.

**Options:**
- `--force` - Overwrite existing .mcp directory
- `--template <type>` - Project template (default, web-app, api-service, cli-tool)

**Examples:**
```bash
# Initialize in current directory
mcp-devkit init

# Initialize new project directory
mcp-devkit init my-project

# Use specific template
mcp-devkit init my-api --template api-service

# Force overwrite existing
mcp-devkit init . --force
```

### `mcp-devkit validate [path]`

Validate project files and structure.

**Options:**
- `--strict` - Enable strict validation mode
- `--format <type>` - Output format (text, json, markdown)
- `--fix` - Automatically fix issues where possible

**Examples:**
```bash
# Validate current project
mcp-devkit validate

# Validate specific directory
mcp-devkit validate src/

# Get JSON output
mcp-devkit validate --format json

# Strict mode with auto-fix
mcp-devkit validate --strict --fix
```

### `mcp-devkit enhance <file>`

Enhance documents using AI agents.

**Options:**
- `--agent <type>` - Agent type (mock, shell, openai)
- `--role <role>` - Agent role (architect, reviewer, optimizer, planner)
- `--output <file>` - Output file path
- `--format <type>` - Output format (text, diff, markdown)
- `--dry-run` - Show changes without applying
- `--cost-estimate` - Show estimated cost

**Examples:**
```bash
# Enhance README with default settings
mcp-devkit enhance README.md

# Use specific agent and role
mcp-devkit enhance docs/api.md --agent openai --role architect

# Preview changes
mcp-devkit enhance README.md --dry-run --format diff

# Get cost estimate
mcp-devkit enhance large-doc.md --cost-estimate
```

### `mcp-devkit demo`

Run interactive demonstration of capabilities.

**Options:**
- `--fast` - Run in fast mode with shorter delays
- `--step <number>` - Start from specific step

**Examples:**
```bash
# Full demo
mcp-devkit demo

# Fast demo
mcp-devkit demo --fast

# Start from step 3
mcp-devkit demo --step 3
```

### `mcp-devkit serve`

Start MCP server for Claude Desktop integration.

**Options:**
- `--port <number>` - Server port (default: stdio)
- `--verbose` - Enable verbose logging
- `--config <file>` - Configuration file path

**Examples:**
```bash
# Start MCP server (stdio mode)
mcp-devkit serve

# Start with verbose logging
mcp-devkit serve --verbose

# Use custom configuration
mcp-devkit serve --config ./my-config.json
```

## Configuration

### Project Configuration (`.mcp/project.json`)

```typescript
interface ProjectConfig {
  name: string;
  description: string;
  version: string;
  template: string;
  created: string;
  lastModified: string;
  phases: Array<{
    name: string;
    status: 'pending' | 'in_progress' | 'completed';
    tasks: string[];
  }>;
  settings: {
    validation: {
      strict: boolean;
      autoFix: boolean;
      excludePatterns: string[];
    };
    agents: {
      defaultAgent: string;
      defaultRole: string;
      costLimits: {
        daily: number;
        perRequest: number;
      };
    };
  };
}
```

### Agent Configuration (`.mcp/agents.json`)

```typescript
interface AgentConfig {
  agents: {
    [key: string]: {
      type: 'mock' | 'shell' | 'openai';
      config: {
        apiKey?: string;
        model?: string;
        maxTokens?: number;
        temperature?: number;
      };
      enabled: boolean;
    };
  };
  roles: {
    [key: string]: {
      systemPrompt: string;
      capabilities: string[];
      costMultiplier: number;
    };
  };
}
```

## Error Handling

### Common Error Types

```typescript
interface MCPError {
  code: string;
  message: string;
  details?: any;
}

// Error codes:
// - INVALID_PROJECT: Not in valid mcp-devkit project
// - PERMISSION_DENIED: Insufficient file system permissions  
// - AGENT_ERROR: AI agent communication failure
// - VALIDATION_ERROR: Project validation failure
// - CONFIG_ERROR: Configuration file issues
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    suggestions?: string[];
  };
}
```

## Environment Variables

### Required
- `OPENAI_API_KEY` - OpenAI API key for AI agent integration

### Optional
- `MCP_DEVKIT_LOG_LEVEL` - Logging level (debug, info, warn, error)
- `MCP_DEVKIT_CONFIG_PATH` - Custom configuration file path
- `MCP_DEVKIT_CACHE_DIR` - Cache directory for agent responses
- `MCP_DEVKIT_MAX_FILE_SIZE` - Maximum file size for processing (bytes)

## Rate Limits & Costs

### OpenAI Integration
- Default rate limits apply per OpenAI account
- Cost estimation available via `--cost-estimate` flag
- Configurable daily/per-request limits in project settings

### File Processing
- Maximum file size: 10MB (configurable)
- Concurrent file processing: 5 files
- Validation cache: 1 hour TTL

## Version Compatibility

### MCP Protocol
- Supports MCP v0.5.0+
- Backward compatible tool interface
- Progressive enhancement for new features

### Node.js
- Minimum: Node.js 18.0.0
- Recommended: Node.js 20.0.0+
- TypeScript: 5.0.0+

### Claude Desktop
- Compatible with all versions supporting MCP
- Automatic capability detection
- Graceful degradation for missing features