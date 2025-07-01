[INFO] Running 2 validation rules
# Validation Report

## Summary

| Metric | Count |
|--------|-------|
| Total Files | 21 |
| Valid Files | 14 |
| Files with Issues | 7 |
| Total Issues | 24 |
| Errors | 10 |
| Warnings | 14 |
| Info | 0 |
| Hints | 0 |

## Issues by File

### .mcp/phase-2-tasks.md

- **ERROR**: Missing required section: "## tasks"
  - *Suggested fix: Add a "## tasks" section to the document*

### .mcp/phase-1.5-integrations.md

- **WARNING**:242: Empty section: "Current Phase: ${this.project.phase}" has no content
  - *Suggested fix: Add content to this section or remove the header*
- **WARNING**:240:23: Placeholder text found: "${agent.name}"
  - *Suggested fix: Replace placeholder text with actual content*
- **WARNING**:242:19: Placeholder text found: "${this.project.phase}"
  - *Suggested fix: Replace placeholder text with actual content*
- **WARNING**:245:1: Placeholder text found: "${this.loadArchitectureContext()}"
  - *Suggested fix: Replace placeholder text with actual content*
- **WARNING**:248:1: Placeholder text found: "${this.loadRecentDecisions()}"
  - *Suggested fix: Replace placeholder text with actual content*
- **WARNING**:251:1: Placeholder text found: "${this.loadActiveTasks()}"
  - *Suggested fix: Replace placeholder text with actual content*
- **WARNING**:254:1: Placeholder text found: "${this.loadAgentInstructions(agent)}"
  - *Suggested fix: Replace placeholder text with actual content*
- **WARNING**:286: Heading level jump: jumped from H1 to H4
  - *Suggested fix: Use H2 instead of H4*

### .mcp/phase-1-tasks.md

- **WARNING**:114:20: Placeholder text found: "${OPENAI_API_KEY}"
  - *Suggested fix: Replace placeholder text with actual content*
- **ERROR**: Missing required section: "## tasks"
  - *Suggested fix: Add a "## tasks" section to the document*

### .mcp/phase-0-tasks.md

- **ERROR**: Missing required section: "## tasks"
  - *Suggested fix: Add a "## tasks" section to the document*

### .mcp/integration-strategy.md

- **WARNING**:79: Heading level jump: jumped from H1 to H3
  - *Suggested fix: Use H2 instead of H3*

### .mcp/context_tasklist.md

- **ERROR**: Missing required section: "## tasks"
  - *Suggested fix: Add a "## tasks" section to the document*

### .mcp/context_prd.md

- **ERROR**: Missing required section: "## overview"
  - *Suggested fix: Add a "## overview" section to the document*
- **ERROR**: Missing required section: "## requirements"
  - *Suggested fix: Add a "## requirements" section to the document*

### .mcp/context_architecture.md

- **ERROR**: Missing required section: "## architecture"
  - *Suggested fix: Add a "## architecture" section to the document*
- **ERROR**: Missing required section: "## components"
  - *Suggested fix: Add a "## components" section to the document*

### .mcp/REQUIREMENTS_BUILDER_ANALYSIS.md

- **ERROR**: Missing required section: "## overview"
  - *Suggested fix: Add a "## overview" section to the document*
- **ERROR**: Missing required section: "## requirements"
  - *Suggested fix: Add a "## requirements" section to the document*

### .mcp/PROJECT_SUMMARY.md

- **WARNING**:121:28: Placeholder text found: "Todo"
  - *Suggested fix: Replace placeholder text with actual content*

### .mcp/IMPLEMENTATION_START.md

- **WARNING**:27: Empty section: "Go to GitHub and create 'mcp-devkit' repo" has no content
  - *Suggested fix: Add content to this section or remove the header*
- **WARNING**:33: Heading level jump: jumped from H1 to H3
  - *Suggested fix: Use H2 instead of H3*
- **WARNING**:39: Heading level jump: jumped from H1 to H3
  - *Suggested fix: Use H2 instead of H3*


Validation Summary
──────────────────────────────────────────────────
Files processed: 21
Valid files: 14
Files with issues: 7
Total issues: 24

Issues by severity:
  ● Errors: 10
  ● Warnings: 14

Completed in 11ms
