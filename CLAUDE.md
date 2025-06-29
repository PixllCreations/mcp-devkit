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

**Implementation Phase**: 🔄 **READY TO START**
- ⏳ **BLOCKING**: User must create GitHub repository and copy planning docs
- ⏳ **Sprint 1**: Foundation & Setup (26 story points, 5 days)
- ⏳ **Sprint 2-4**: Core features, integrations, polish

## Project Structure (Current)
```
/Users/escott/Documents/Personal/pid/
├── .mcp/                                    # Planning documents (complete)
│   ├── context_prd.md                      # Product Requirements Document
│   ├── context_architecture.md             # Technical Architecture  
│   ├── context_tasklist.md                 # Original task breakdown
│   ├── development-overview.md             # Agile development plan
│   ├── phase-0-tasks.md                   # Sprint 1: Foundation (26 SP)
│   ├── phase-1-tasks.md                   # Sprint 2: Core Features
│   ├── phase-1.5-integrations.md          # Sprint 3: Tool Integrations
│   ├── phase-2-tasks.md                   # Sprint 4: Polish & Deploy
│   ├── integration-strategy.md            # Tool ecosystem strategy
│   ├── claude-workflow-enhancement.md     # Claude integration details
│   ├── claude-usage-examples.md           # Real-world usage scenarios
│   ├── user-tasks.md                      # Required user actions
│   ├── IMPLEMENTATION_START.md            # Getting started guide
│   └── archive/                           # Multi-agent refinement history
├── README.md                              # Updated project overview
└── CLAUDE.md                             # This context file
```

## Key Implementation Details

### Technical Stack
- **TypeScript** with strict mode for type safety
- **Commander.js** for CLI interface 
- **@modelcontextprotocol/sdk** for MCP server implementation
- **AJV** for JSON schema validation
- **Vitest** for testing framework

### Architecture Approach
- **Dual Interface**: MCP server (primary) + CLI tool (secondary)
- **Persistent State**: `.mcp/` directory structure for project memory
- **Multi-Agent System**: Pluggable architecture (not hardcoded to 3 agents)
- **Tool Integration**: RepoPrompt, Serena, claude-code-requirements-builder

## Critical Next Steps

### User Tasks (Blocking Development)
1. **Create GitHub repository** named `mcp-devkit` (10 minutes)
2. **Copy planning docs** to new repository (5 minutes)
See `.mcp/user-tasks.md` for detailed instructions.

### Development Tasks (After User Setup)
1. **TASK-001**: Initialize GitHub repository structure
2. **TASK-002**: Set up TypeScript project  
3. **TASK-003**: Create initial project structure
See `.mcp/phase-0-tasks.md` for complete Sprint 1 breakdown.

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
2. **Reference** `.mcp/phase-0-tasks.md` for current sprint tasks
3. **Use TodoWrite/TodoRead** tools to track implementation progress
4. **Follow** the systematic approach demonstrated in planning phase