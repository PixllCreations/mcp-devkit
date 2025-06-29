# mcp-devkit

> **Claude's Persistent Development Partner** - An MCP server that prevents context drift and maintains project memory across all development sessions.

[![npm version](https://badge.fury.io/js/mcp-devkit.svg)](https://badge.fury.io/js/mcp-devkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

## 🎯 The Problem

Claude is amazing for development, but suffers from critical limitations:

- **Context Drift** 🌊 - Loses focus during long development sessions
- **Memory Loss** 🧠 - Forgets project context between sessions  
- **No Persistence** 💾 - Architectural decisions disappear when conversations end
- **Project Abandonment** 🏗️ - No way to resume stalled projects systematically

## ✨ The Solution

mcp-devkit transforms Claude into your **persistent development partner** through an MCP server that provides:

### 🧠 **Persistent Project Memory**
- Project state survives across all Claude sessions
- Architectural decisions and progress automatically preserved
- Never lose context when returning to a project

### 🎯 **Development Guidance & Anti-Drift**
- Systematic task prioritization keeps Claude focused
- Drift detection prevents over-architecture and scope creep
- Clear breakpoints prevent context overload

### 🤝 **Multi-Agent Orchestration**
- Delegate planning and review to specialized AIs (GPT-4, Gemini)
- Get expert consultation without bloating Claude's context
- Maintain implementation focus while leveraging multiple perspectives

### 🚀 **Project Recovery**
- Analyze any existing codebase and generate recovery plans
- Identify exactly where development stalled and why
- Resume abandoned projects with specific next steps

## 🔧 How It Works

### For Claude Users:
```typescript
// Claude can directly call these tools during development:

"Let me set up this project properly..."
→ mcp_init_guided() // Creates structured development plan

"Before I continue, let me check our progress..."  
→ mcp_get_status() // Shows current phase and next tasks

"Am I drifting from the plan?"
→ mcp_check_drift() // Keeps conversation on track

"This needs technical review..."
→ mcp_technical_review() // GPT-4 analyzes, returns summary

"Let me pick up this old project..."
→ mcp_analyze_project() // Generates recovery plan
```

### Real Claude Conversation:
```
User: "I want to build a task management SaaS"

Claude: "I'll use mcp-devkit to set this up properly."
[Calls mcp_init_guided()]

"Perfect! I've created a 3-phase development plan. We're starting 
with Phase 1: Foundation (Next.js + Auth). Let me begin with 
the project setup..."

[2 hours later]

"Let me check our progress before continuing..."
[Calls mcp_get_status()]

"Excellent! We're 65% through Phase 1. Auth system is complete, 
now moving to the user dashboard as planned..."
```

## 🚀 Quick Start

### 1. Install mcp-devkit
```bash
npm install -g mcp-devkit
```

### 2. Configure Claude Desktop
Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "mcp-devkit": {
      "command": "mcp-devkit",
      "args": ["serve"]
    }
  }
}
```

### 3. Start Developing
Open Claude Desktop and start any development project. Claude now has access to persistent project management tools!

## 🛠️ MCP Tools Available to Claude

| Tool | Purpose | When Claude Uses It |
|------|---------|-------------------|
| `mcp_init_guided` | Initialize new projects | Starting any new development project |
| `mcp_get_status` | Check project status | Beginning sessions, checking progress |
| `mcp_next_task` | Get prioritized next task | When unsure what to work on next |
| `mcp_check_drift` | Detect conversation drift | During long development sessions |
| `mcp_analyze_project` | Analyze existing codebases | Picking up abandoned projects |
| `mcp_plan_refinement` | Multi-agent planning | Complex architectural decisions |
| `mcp_technical_review` | Expert technical review | Validating implementation approaches |

## 📊 Project State Resources

Claude also has read access to:

- **Current Status**: Real-time progress, phase, and next steps
- **Architecture Decisions**: All technical decisions with rationale
- **Task History**: Completed work and lessons learned
- **Project Analytics**: Development velocity and bottleneck identification

## 🎨 Usage Examples

### Starting a New Project
```
Claude: "I'll initialize this React app with mcp-devkit..."
→ Creates structured 3-phase development plan
→ Sets up project templates and guidance
→ Begins systematic implementation
```

### Staying Focused During Development
```
Claude: "Before implementing this feature..."
→ Checks current project status
→ Verifies work aligns with development plan
→ Proceeds with confidence and focus
```

### Multi-Agent Consultation
```
Claude: "This architecture needs expert review..."
→ GPT-4 analyzes approach in background
→ Returns summary and recommendations
→ Claude incorporates feedback without context loss
```

### Project Recovery
```
Claude: "Let me analyze this stalled project..."
→ Identifies 45% completion, specific blocker
→ Generates recovery plan with next steps
→ Resumes development systematically
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Claude        │    │   mcp-devkit     │    │  Project State  │
│   Desktop       │◄──►│   MCP Server     │◄──►│   Persistence   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Multi-Agent     │
                       │  Orchestration   │
                       │ (GPT-4, Gemini)  │
                       └──────────────────┘
```

## 📈 Benefits

### For Developers:
- ✅ **Complete Projects**: Systematic approach prevents abandonment
- ✅ **Stay Focused**: Anti-drift mechanisms keep development on track  
- ✅ **Session Continuity**: Pick up exactly where you left off
- ✅ **Expert Guidance**: Multi-agent consultation without context bloat

### For Teams:
- ✅ **Consistent Process**: Standardized AI-assisted development
- ✅ **Knowledge Preservation**: Project memory survives team changes
- ✅ **Onboarding**: New developers can immediately understand project state

## 🛣️ Roadmap

- ✅ **Phase 0**: Core MCP server with basic tools
- 🔄 **Phase 1**: Advanced project analytics and custom templates
- 📋 **Phase 2**: Team collaboration and handoff features
- 🎯 **Phase 3**: Integration ecosystem (RepoPrompt, Serena, VS Code)

## 🤝 Contributing

We welcome contributions! This project demonstrates advanced MCP server development and AI workflow optimization.

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Documentation](https://mcp-devkit.dev)
- [Examples](./examples/)
- [Architecture Guide](./docs/architecture.md)
- [MCP Protocol](https://modelcontextprotocol.io/)

---

**mcp-devkit**: Transforming Claude from a helpful assistant into your persistent development partner. 🚀

*Built with ❤️ for the AI-assisted development community*