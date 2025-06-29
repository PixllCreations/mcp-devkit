# Quick Start Guide

Get up and running with mcp-devkit in 5 minutes!

## 🚀 Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Claude Desktop (for MCP integration)

### Install mcp-devkit
```bash
npm install -g mcp-devkit
```

Verify installation:
```bash
mcp-devkit --version
```

## 🔧 CLI Usage

### Initialize a New Project
```bash
# Create in current directory
mcp-devkit init

# Create in specific directory
mcp-devkit init my-project

# Force overwrite existing .mcp directory
mcp-devkit init --force
```

### What Gets Created
```
your-project/
└── .mcp/
    ├── context_prd.md          # Product requirements template
    ├── context_architecture.md # Architecture documentation
    ├── context_tasklist.md     # Task tracking
    ├── metadata.json           # Project metadata
    └── archive/                # Historical artifacts
```

## 🤖 Claude Desktop Integration

### 1. Configure Claude Desktop

Add mcp-devkit to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

### 2. Restart Claude Desktop

After updating the configuration, restart Claude Desktop to load the MCP server.

### 3. Start Using MCP Tools

In your Claude conversation, the assistant can now use these tools:

```typescript
// Initialize a new project
mcp_init_guided({
  projectPath: "./my-app",
  projectType: "web-app",
  requirements: "E-commerce platform with user auth"
})

// Check project status
mcp_get_status({
  projectPath: "./my-app"
})

// Get next task
mcp_next_task()

// Check for conversation drift
mcp_check_drift({
  currentDiscussion: "Should we use MongoDB instead?",
  sessionLength: 45
})
```

## 📝 Working with Templates

### 1. Fill Out Templates

After initialization, edit the template files:

**Product Requirements** (`.mcp/context_prd.md`):
- Define your problem statement
- Identify target users
- List core requirements
- Set success metrics

**Architecture** (`.mcp/context_architecture.md`):
- Document technology choices
- Define system components
- Plan data flow
- Consider scalability

**Task List** (`.mcp/context_tasklist.md`):
- Break down development tasks
- Assign story points
- Track progress
- Note blockers

### 2. Template Tips

- Keep templates updated as project evolves
- Use markdown formatting for clarity
- Check templates into version control
- Review before each Claude session

## 🎯 Best Practices

### 1. Start Each Session Right
```
Claude: "Let me check our project status first..."
[Uses mcp_get_status]

"We're 45% through Phase 1, currently working on user authentication.
Let me continue where we left off..."
```

### 2. Prevent Context Drift
```
Claude: "Before we discuss this further, let me check if we're drifting..."
[Uses mcp_check_drift]

"This seems like premature optimization. Let's focus on completing 
the current feature first."
```

### 3. Regular Progress Updates
```
Claude: "I've completed the auth system. Let me update our progress..."
[Updates task list]
[Uses mcp_get_status]

"Great! That puts us at 60% completion for Phase 1."
```

## 🔍 Troubleshooting

### CLI Issues

**"mcp-devkit: command not found"**
- Ensure global npm bin directory is in PATH
- Try: `npm list -g mcp-devkit`
- Reinstall: `npm install -g mcp-devkit`

**".mcp directory already exists"**
- Use `--force` flag to overwrite
- Or manually remove existing directory

### MCP Server Issues

**"MCP server not responding"**
- Check Claude Desktop logs
- Verify configuration syntax
- Ensure mcp-devkit is installed globally
- Restart Claude Desktop

**"Tool not available"**
- Confirm MCP server is running
- Check for error messages in Claude
- Verify tool name spelling

## 📚 Next Steps

1. **Explore Examples**: Check out the [examples directory](../examples/)
2. **Read Architecture**: Understand the [system design](./architecture.md)
3. **Contribute**: See [contributing guidelines](../CONTRIBUTING.md)
4. **Get Help**: Open an issue on [GitHub](https://github.com/escott/mcp-devkit)

## 💡 Pro Tips

- **Version Control**: Always commit your `.mcp/` directory
- **Team Work**: Share templates with your team
- **Customization**: Modify templates for your workflow
- **Integration**: Combine with other Claude tools

---

Ready to build something amazing with Claude as your persistent development partner! 🚀