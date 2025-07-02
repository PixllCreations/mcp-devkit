# Getting Started with MCP DevKit

**MCP DevKit** is Claude's Persistent Development Partner - an MCP server that prevents context drift and maintains project memory across all development sessions.

## Quick Installation

```bash
npm install -g @yourusername/mcp-devkit
```

## Initial Setup

### 1. Configure Claude Desktop

Add to your Claude Desktop MCP settings (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mcp-devkit": {
      "command": "mcp-devkit",
      "args": ["serve"],
      "env": {}
    }
  }
}
```

### 2. Initialize Your First Project

```bash
# Create a new project
mcp-devkit init my-awesome-project
cd my-awesome-project

# Or initialize in existing directory
mcp-devkit init .
```

### 3. Run Interactive Demo

```bash
mcp-devkit demo
```

## Basic Workflow

### Project Initialization
```bash
# Initialize with default template
mcp-devkit init my-project

# Initialize with specific template
mcp-devkit init my-project --template api-service

# Force overwrite existing .mcp directory
mcp-devkit init my-project --force
```

### Validation
```bash
# Validate current project
mcp-devkit validate

# Validate specific path
mcp-devkit validate src/

# Strict validation with JSON output
mcp-devkit validate --strict --format json
```

### Document Enhancement
```bash
# Enhance README with AI
mcp-devkit enhance README.md

# Use specific agent and role
mcp-devkit enhance docs/api.md --agent openai --role architect

# Dry run with cost estimation
mcp-devkit enhance README.md --dry-run --cost-estimate

# Output to different file
mcp-devkit enhance input.md --output enhanced.md
```

## Claude Integration

Once configured, Claude will have access to these tools:

- `mcp_init_guided()` - Initialize projects with AI planning
- `mcp_get_status()` - Check project progress
- `mcp_next_task()` - Get prioritized next tasks
- `mcp_check_drift()` - Prevent scope creep
- `mcp_analyze_project()` - Analyze existing codebases
- `mcp_plan_refinement()` - Multi-agent planning cycles
- `mcp_technical_review()` - Expert technical consultation

## Project Structure

After initialization, your project will have:

```
my-project/
├── .mcp/                    # Project memory and configuration
│   ├── project.json        # Project metadata
│   ├── tasks.md            # Task tracking
│   ├── agents.json         # Agent configuration
│   └── templates/          # Custom templates
├── src/                    # Source code
├── tests/                  # Test files
└── README.md              # Enhanced documentation
```

## Next Steps

1. **Explore Examples**: Check out [`docs/examples/`](./examples/) for real-world use cases
2. **Read Architecture**: Understand the system in [`docs/architecture.md`](./architecture.md)
3. **API Reference**: Browse available tools in [`docs/api-reference.md`](./api-reference.md)
4. **Advanced Usage**: Learn about multi-agent workflows and integrations

## Troubleshooting

### Common Issues

**MCP Server Not Found**
- Ensure mcp-devkit is installed globally: `npm install -g @yourusername/mcp-devkit`
- Restart Claude Desktop after configuration changes

**Permission Errors**
- Run with appropriate permissions for file system access
- Check that the target directory is writable

**Agent Configuration**
- Verify API keys are set in environment variables
- Check `.mcp/agents.json` for proper configuration

### Getting Help

- 📖 [Documentation](https://mcp-devkit.dev)
- 🐛 [Issue Tracker](https://github.com/yourusername/mcp-devkit/issues)
- 💬 [Discussions](https://github.com/yourusername/mcp-devkit/discussions)
- 📧 [Email Support](mailto:support@mcp-devkit.dev)