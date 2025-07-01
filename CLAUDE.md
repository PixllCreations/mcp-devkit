# Claude Context File for mcp-devkit

## Project Overview

**mcp-devkit** is Claude's **Persistent Development Partner** - an MCP (Model Context Protocol) server that prevents context drift and maintains project memory across all development sessions.

## What This Project Actually Is

**mcp-devkit** is a **software product** that provides:

- **MCP Server**: Primary interface that integrates directly with Claude Desktop
- **Persistent Project Memory**: Project state survives across all Claude sessions  
- **Development Guidance Tools**: Systematic task prioritization and drift prevention
- **Multi-Agent Orchestration**: Delegate planning/review to specialized AIs without context loss
- **Project Recovery**: Analyze and resume any abandoned or stalled project
- **CLI Tool**: Secondary command-line interface for direct project management

## The Problem mcp-devkit Solves

Claude suffers from critical limitations during software development:
- **Context Drift**: Loses focus during long development sessions
- **Memory Loss**: Project context disappears between sessions
- **No Persistence**: Architectural decisions vanish when conversations end
- **Project Abandonment**: No systematic way to recover stalled projects

## Your Role with mcp-devkit

As Claude, when mcp-devkit is installed, you have access to powerful development tools:

### MCP Tools Available to You
```typescript
// Tools you can call during development:
mcp_init_guided()        // Initialize new projects with structured plans
mcp_get_status()         // Check current project state and progress  
mcp_next_task()          // Get the next prioritized task to work on
mcp_check_drift()        // Verify you're staying on track
mcp_analyze_project()    // Analyze existing codebases for recovery
mcp_plan_refinement()    // Run multi-agent planning cycles
mcp_technical_review()   // Get expert technical consultation
```

### Your Workflow with mcp-devkit
1. **Project Setup**: Call `mcp_init_guided()` to create structured development plan
2. **Stay Focused**: Use `mcp_check_drift()` to prevent over-architecture 
3. **Track Progress**: Call `mcp_get_status()` to understand current state
4. **Get Guidance**: Use `mcp_next_task()` when unsure what to work on
5. **Expert Consultation**: Call `mcp_technical_review()` for specialized analysis
6. **Project Recovery**: Use `mcp_analyze_project()` to resume abandoned work

## Current Project Status

**Planning Phase**: ✅ **COMPLETE**
- ✅ PRD finalized with multi-agent refinement (Claude → GPT-4 → Gemini)
- ✅ Architecture documented for MCP server approach
- ✅ Task breakdown organized into 4 agile sprints  
- ✅ Integration strategy defined for tool ecosystem
- ✅ All documents reflect enhanced vision as "Claude's Persistent Development Partner"

**Implementation Phase**: 🔄 **IN PROGRESS**
- ✅ **Sprint 1**: Foundation & Setup (26 story points, 5 days) - **COMPLETE**
- ✅ **Sprint 2**: Validation System (26 story points, 5 days) - **COMPLETE**
- ✅ **Sprint 3**: Agent System (29 story points, 5 days) - **COMPLETE**
- ⏳ **Sprint 4**: Polish & Deploy - **NEXT UP**

## Project Structure (Current)
```
/Users/escott/Documents/Personal/pid/mcp-devkit/
├── src/                                     # Source code
│   ├── cli/                                # CLI implementation
│   │   ├── index.ts                       # Main CLI entry point
│   │   └── commands/                      # CLI commands
│   │       ├── init.ts                    # Project initialization
│   │       ├── validate.ts                # ✅ Validation command
│   │       └── enhance.ts                 # ✨ NEW: Document enhancement
│   ├── core/                              # Core business logic
│   │   ├── templates/                     # Template system
│   │   ├── validators/                    # ✅ Validation system
│   │   │   ├── types.ts                   # Validator interfaces
│   │   │   ├── base.ts                    # Base validator class
│   │   │   ├── registry.ts                # Plugin registry
│   │   │   ├── validator.ts               # Main validator
│   │   │   ├── markdown-validator.ts      # Markdown rules
│   │   │   ├── schema-validator.ts        # JSON schema validation
│   │   │   └── builtin-plugin.ts          # Built-in validators
│   │   └── agents/                        # ✨ NEW: Agent system
│   │       ├── types.ts                   # Agent interfaces & enums
│   │       ├── base.ts                    # Base agent class
│   │       ├── registry.ts                # Agent registry
│   │       ├── config.ts                  # Configuration management
│   │       ├── mock-agent.ts              # Mock agent for testing
│   │       ├── shell-agent.ts             # Shell command agent
│   │       └── openai-agent.ts            # OpenAI API agent
│   ├── mcp/                               # MCP server implementation
│   │   ├── server.ts                      # MCP server
│   │   └── tools.ts                       # MCP tool definitions
│   ├── types/                             # TypeScript types
│   └── utils/                             # Utilities
├── tests/                                  # Test files
│   └── validators/                        # ✨ NEW: Validator tests
├── .mcp/                                  # Planning documents
│   ├── phase-0-tasks.md                  # Sprint 1: Foundation ✅
│   ├── phase-1-tasks.md                  # Sprint 2-3: Core Features ✅
│   ├── phase-1.5-integrations.md         # Sprint 3: Tool Integrations ✅
│   ├── phase-2-tasks.md                  # Sprint 4: Polish & Deploy
│   └── agents.json                       # ✨ NEW: Agent configuration
├── dist/                                  # Built JavaScript files
├── coverage/                              # Test coverage reports
├── .github/                               # CI/CD workflows
├── package.json                           # Dependencies & scripts
├── tsconfig.json                          # TypeScript configuration
├── README.md                              # Project overview
└── CLAUDE.md                             # This context file
```

## Key Implementation Details

### Technical Stack
- **TypeScript** with strict mode for type safety
- **Commander.js** for CLI interface 
- **@modelcontextprotocol/sdk** for MCP server implementation
- **AJV** for JSON schema validation
- **OpenAI SDK** for AI agent integration
- **Vitest** for testing framework

### Architecture Approach
- **Dual Interface**: MCP server (primary) + CLI tool (secondary)
- **Persistent State**: `.mcp/` directory structure for project memory
- **Multi-Agent System**: Pluggable architecture (not hardcoded to 3 agents)
- **Tool Integration**: RepoPrompt, Serena, claude-code-requirements-builder

## Critical Next Steps

### Sprint 4: Polish & Deploy (Next Up)
1. **TASK-036**: Create cycle command for multi-agent orchestration
2. **TASK-037**: Add caching system for agent responses
3. **TASK-038**: Implement RepoPrompt integration
4. **TASK-039**: Implement Serena integration hooks
5. **TASK-040**: Complete MCP server tools
See `.mcp/phase-2-tasks.md` for complete Sprint 4 breakdown.

### Recent Achievements
- ✅ **Sprint 1**: All 17 tasks completed - foundation, CLI, MCP server
- ✅ **Sprint 2**: 8/10 tasks completed - validation system fully operational
- ✅ **Sprint 3**: All 8 tasks completed - complete agent system operational
- ✨ **NEW**: `mcp validate` command finds issues in project files
- ✨ **NEW**: `mcp enhance` command with 3 agent types and 4 roles

## Development Principles

When implementing mcp-devkit:
- **Quality First**: >80% test coverage, TypeScript strict mode
- **User Experience**: Intuitive CLI with helpful error messages
- **Integration Focus**: Seamless Claude Desktop integration via MCP
- **Portfolio Quality**: This demonstrates advanced MCP development skills

## Important Notes

- This project demonstrates using mcp-devkit's own methodology to plan itself
- All planning documents are production-ready and demonstrate the approach
- The multi-agent refinement cycle identified and mitigated critical risks
- Ready for immediate implementation once user completes setup tasks

When resuming work on mcp-devkit:
1. **Always check** `.mcp/user-tasks.md` for required user actions first
2. **Reference** `.mcp/phase-2-tasks.md` for current sprint tasks (Sprint 4)
3. **Use TodoWrite/TodoRead** tools to track implementation progress
4. **Follow** the systematic approach demonstrated in planning phase

## Available Commands

### CLI Commands
```bash
# Initialize new project
mcp-devkit init my-project

# Validate project files  
mcp-devkit validate [path] --strict --format json

# Enhance documents with AI agents
mcp-devkit enhance README.md --agent openai --role architect
mcp-devkit enhance doc.md --dry-run --cost-estimate
mcp-devkit enhance file.md --format diff --output enhanced.md

# Start MCP server (coming in Sprint 4)
mcp-devkit serve
```

### Agent System
- **3 Agent Types**: Mock (testing), Shell (local commands), OpenAI (GPT models)
- **4 Built-in Roles**: architect, reviewer, optimizer, planner
- **Configuration**: `.mcp/agents.json` with environment variable support
- **Features**: Cost estimation, token tracking, change analysis