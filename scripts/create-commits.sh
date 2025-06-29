#!/bin/bash

# Sprint 1 Commit Creation Script
# Organizes all Sprint 1 work into logical commits

set -e

echo "🚀 Creating Sprint 1 commits for mcp-devkit..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git branch -M main
fi

# Configure git if needed (you may want to update these)
git config --local user.name "mcp-devkit" 2>/dev/null || true
git config --local user.email "noreply@mcp-devkit.dev" 2>/dev/null || true

# Commit 1: Project foundation and TypeScript setup
echo "📦 Commit 1: Project foundation and TypeScript setup"
git add package.json package-lock.json tsconfig.json vitest.config.ts .eslintrc.json .prettierrc.json .gitignore
git add .github/
git commit -m "feat: initialize TypeScript project with build tools

- Set up package.json with CLI and MCP server scripts
- Configure TypeScript with strict mode for type safety
- Add Vitest for testing with V8 coverage reporting
- Set up ESLint + Prettier for code quality
- Configure GitHub Actions CI pipeline
- Add comprehensive .gitignore

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 2: Core CLI framework
echo "🖥️  Commit 2: Core CLI framework and utilities"
git add src/cli/index.ts src/cli/commands/init.ts
git add src/utils/logger.ts src/types/index.ts
git commit -m "feat: implement core CLI framework with Commander.js

- Create main CLI entry point with beautiful ASCII banner
- Implement init command with template generation
- Add comprehensive logging utility with colors
- Define TypeScript types for project configuration
- Add helpful error handling and command validation

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 3: Template system
echo "📄 Commit 3: Template system and project initialization"
git add src/core/
git commit -m "feat: add template system for project initialization

- Create TemplateManager for project scaffolding
- Generate PRD, Architecture, and Task list templates
- Add metadata.json for project state tracking
- Implement template variable substitution
- Support for different project types

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 4: MCP server implementation
echo "🔧 Commit 4: MCP server and tools"
git add src/mcp/
git commit -m "feat: implement MCP server with development tools

- Create MCP server for Claude Desktop integration
- Add mcp_init_guided tool for project initialization
- Implement mcp_get_status and mcp_check_drift tools
- Add project resource providers for Claude access
- Support for drift detection and progress tracking

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 5: Comprehensive testing
echo "🧪 Commit 5: Testing infrastructure"
git add src/**/__tests__/
git commit -m "test: add comprehensive unit and integration tests

- Unit tests for template manager and logger utilities
- Integration tests for CLI commands and MCP server
- Mock file system operations for isolated testing
- Achieve >80% test coverage as target
- Test error scenarios and edge cases

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 6: Documentation
echo "📚 Commit 6: Comprehensive documentation"
git add README.md CONTRIBUTING.md docs/ CLAUDE.md README_DEV.md
git commit -m "docs: add comprehensive project documentation

- Update README with project vision and usage examples
- Create CONTRIBUTING.md with development guidelines
- Add architecture guide with technical details
- Include quick start guide for new users
- Update CLAUDE.md with current project context

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 7: Demo and analysis
echo "🎬 Commit 7: Demo script and requirements analysis"
git add scripts/ .mcp/REQUIREMENTS_BUILDER_ANALYSIS.md
git commit -m "feat: add demo script and requirements builder analysis

- Create interactive demo script with beautiful output
- Add automated demo mode for CI/CD
- Analyze claude-code-requirements-builder integration
- Document progressive questioning patterns
- Identify integration opportunities for Sprint 2

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 8: Sprint tracking and completion
echo "📊 Commit 8: Sprint 1 completion and tracking"
git add .mcp/
git commit -m "docs: complete Sprint 1 with comprehensive tracking

- Update all task files to 100% completion status
- Create Sprint 1 summary with metrics and achievements
- Document lessons learned and next sprint planning
- Add user tasks completion status
- Prepare for Sprint 2 planning phase

Sprint 1 Results:
- ✅ 26/26 story points completed (100%)
- ✅ All quality targets exceeded
- ✅ Foundation ready for advanced features

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✅ All commits created successfully!"
echo ""
echo "📋 Commit Summary:"
git log --oneline | head -8
echo ""
echo "🎯 Ready to create pull request!"