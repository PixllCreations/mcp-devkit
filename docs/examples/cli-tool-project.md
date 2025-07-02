# Example: CLI Tool Project

This example shows building a Node.js CLI tool for file organization using mcp-devkit's systematic approach.

## Project Overview

**Goal**: Create a CLI tool that automatically organizes files in directories based on type, date, or custom rules.

**Tech Stack**: Node.js, TypeScript, Commander.js, Chalk, Inquirer

## Project Initialization

```bash
# Initialize CLI tool project
mcp-devkit init file-organizer --template cli-tool
cd file-organizer
```

**Generated Structure:**
```
file-organizer/
├── .mcp/
│   ├── project.json
│   ├── tasks.md
│   └── templates/
├── src/
│   ├── commands/
│   ├── utils/
│   ├── types/
│   └── index.ts
├── bin/
├── tests/
├── package.json
└── README.md
```

## Development with mcp-devkit

### Planning Phase

**Claude Integration:**
```typescript
// Get initial guidance
await mcp_plan_refinement({
  agents: ['architect', 'planner'],
  focus: 'CLI tool architecture and user experience'
});
```

**Planning Output:**
- Command structure: `organize`, `rules`, `preview`, `undo`
- Configuration system for custom rules
- Safe mode with preview and undo functionality
- Plugin architecture for custom organizers

### Implementation Progress

**Task Management:**
```typescript
// Get next task
await mcp_next_task({ 
  category: 'implementation',
  timeAvailable: 120 // 2 hours available
});
```

**Response:**
```json
{
  "task": {
    "id": "TASK-003",
    "title": "Implement file detection and categorization",
    "description": "Create system to analyze files and determine organization rules",
    "estimatedTime": 90,
    "acceptance_criteria": [
      "Detect file types by extension and content",
      "Support image, document, video, audio categories",
      "Handle edge cases (no extension, multiple dots)",
      "Provide extensible categorization system"
    ]
  },
  "reasoning": "Core functionality needed before building commands"
}
```

### Drift Prevention

**Mid-development check:**
```typescript
await mcp_check_drift({
  currentFocus: 'implementing advanced regex patterns for file matching',
  context: 'spent 2 hours on complex regex for rare file types'
});
```

**Drift Warning:**
```json
{
  "isDrifting": true,
  "driftType": "scope",
  "recommendation": "Simple extension-based detection sufficient for MVP",
  "suggestedAction": "Implement basic categorization first, defer advanced matching"
}
```

## Key Implementation Phases

### Phase 1: Core CLI Structure

```typescript
// Implementation guided by mcp-devkit
```

**Commands implemented:**
1. `organize` - Main organization command
2. `preview` - Show what would be organized
3. `rules` - Manage organization rules
4. `undo` - Reverse last organization

**Validation results:**
```bash
mcp-devkit validate --strict
```
```
✅ Command structure follows CLI best practices
✅ Error handling implemented correctly
⚠️  Missing help text for some commands
✅ TypeScript types properly defined
```

### Phase 2: Organization Logic

**Technical Review:**
```typescript
await mcp_technical_review({
  focus: 'architecture',
  files: ['src/organizers/FileOrganizer.ts']
});
```

**Review Findings:**
- ✅ Good separation of concerns
- 🟡 Could benefit from strategy pattern for different organization types
- 🔴 Missing comprehensive error handling for file operations
- 💡 Consider adding progress bars for large directories

### Phase 3: User Experience Polish

**Enhanced CLI Output:**
```bash
mcp-devkit enhance README.md --role optimizer
```

**Before/After CLI Demo:**

**Before:**
```bash
$ file-organizer organize ~/Downloads
Organized 45 files.
```

**After:**
```bash
$ file-organizer organize ~/Downloads
🗂️  File Organizer v1.0.0

📁 Analyzing ~/Downloads...
   Found 127 files to organize

📊 Organization Plan:
   📸 Images    → ~/Downloads/Images/     (23 files)
   📄 Documents → ~/Downloads/Documents/  (45 files)
   🎵 Audio     → ~/Downloads/Audio/      (12 files)
   📹 Videos    → ~/Downloads/Videos/     (8 files)
   📦 Archives  → ~/Downloads/Archives/   (4 files)
   ❓ Other     → ~/Downloads/Other/      (35 files)

✨ Organization complete! 127 files organized in 2.3s
💡 Run 'file-organizer undo' to reverse this operation
```

## Advanced Features

### Configuration System

**mcp-devkit guided implementation:**
```typescript
// .file-organizer.config.js
module.exports = {
  rules: {
    images: {
      extensions: ['.jpg', '.png', '.gif', '.svg'],
      destination: 'Images/{{year}}/{{month}}',
      dateFrom: 'modified'
    },
    documents: {
      extensions: ['.pdf', '.doc', '.docx', '.txt'],
      destination: 'Documents/{{type}}',
      organize: true
    }
  },
  
  plugins: [
    '@file-organizer/date-plugin',
    './custom-rules.js'
  ]
};
```

### Plugin Architecture

**Technical guidance from multi-agent review:**
```typescript
// Plugin interface designed with AI assistance
interface OrganizerPlugin {
  name: string;
  version: string;
  
  categorize(file: FileInfo): Promise<CategoryResult>;
  getDestination(file: FileInfo, category: string): Promise<string>;
  shouldProcess(file: FileInfo): boolean;
}
```

## Documentation Enhancement

**AI-Enhanced Documentation:**

```bash
mcp-devkit enhance README.md --agent openai --role architect
```

**Generated README highlights:**

```markdown
# 🗂️ File Organizer - Intelligent File Management CLI

> Transform chaotic directories into organized spaces with intelligent, rule-based file organization

[![npm version](https://badge.fury.io/js/file-organizer-cli.svg)](https://badge.fury.io/js/file-organizer-cli)
[![Build Status](https://travis-ci.org/user/file-organizer.svg?branch=main)](https://travis-ci.org/user/file-organizer)

## 🚀 Quick Start

```bash
# Install globally
npm install -g file-organizer-cli

# Organize Downloads folder
file-organizer organize ~/Downloads

# Preview changes first
file-organizer preview ~/Downloads

# Undo last organization
file-organizer undo
```

## ✨ Features

- **🧠 Smart Detection** - Recognizes 50+ file types automatically
- **📅 Date Organization** - Group by creation, modification, or EXIF date
- **⚡ Fast & Safe** - Preview mode and undo functionality
- **🔧 Configurable** - Custom rules and destination patterns
- **🔌 Extensible** - Plugin system for custom behaviors
- **🎨 Beautiful Output** - Rich CLI interface with progress indicators

## 📖 Use Cases

### Developer Workflow
```bash
# Organize project downloads
file-organizer organize ~/Downloads --rule dev-files

# Result:
# ~/Downloads/
# ├── Images/2024/03/           # Screenshots
# ├── Documents/specs/          # PDFs, docs
# ├── Code/libraries/           # .zip, .tar.gz
# └── Other/                    # Everything else
```

### Photo Management
```bash
# Organize photos by date
file-organizer organize ~/Pictures --rule photos-by-date

# Result:
# ~/Pictures/
# ├── 2024/
# │   ├── 01-January/
# │   ├── 02-February/
# │   └── 03-March/
# └── Unsorted/                 # Files without date info
```
```

## Testing & Quality

**Comprehensive test coverage guided by mcp-devkit:**

```bash
mcp-devkit validate --format json | jq '.coverage'
```

```json
{
  "lines": 94.2,
  "functions": 96.8,
  "branches": 91.5,
  "statements": 94.2
}
```

**Test categories:**
- Unit tests for all organizers
- Integration tests for CLI commands
- E2E tests with real file systems
- Performance tests with large directories

## Project Outcomes

### Metrics
- **Development Time**: 2 weeks
- **Code Quality**: 94% test coverage
- **Performance**: Organizes 1000+ files in <3 seconds
- **NPM Downloads**: 5,000+ monthly (6 months post-launch)

### mcp-devkit Benefits
1. **Systematic Planning**: Multi-agent architecture review prevented over-engineering
2. **Scope Management**: Drift detection kept focus on core features
3. **Quality Assurance**: Continuous validation maintained code quality
4. **Professional Docs**: AI-enhanced documentation improved adoption

### User Feedback
- "Finally, my Downloads folder is manageable!" - GitHub user
- "The preview mode saved me from disaster" - Reddit comment  
- "Plugin system makes it incredibly flexible" - Product Hunt review

## Distribution

**NPM Package Configuration:**
```json
{
  "name": "file-organizer-cli",
  "bin": {
    "file-organizer": "./dist/index.js",
    "organize": "./dist/index.js"
  },
  "files": ["dist/", "README.md", "LICENSE"],
  "keywords": ["cli", "files", "organization", "productivity"]
}
```

**Installation Analytics:**
- Global installs: 15,000+
- GitHub stars: 500+
- Issues resolved: 95% within 48 hours

## Lessons Learned

1. **User Experience Matters**: Rich CLI output significantly improved user satisfaction
2. **Safety First**: Preview and undo features prevented user data loss
3. **Plugin Architecture**: Extensibility drove adoption by power users
4. **Good Documentation**: AI-enhanced docs reduced support requests by 60%

## Future Enhancements

1. **GUI Application**: Electron wrapper for non-technical users
2. **Cloud Integration**: Sync rules across devices
3. **AI Categorization**: Machine learning for unknown file types
4. **Batch Operations**: Organize multiple directories simultaneously

---

This CLI tool project demonstrates how mcp-devkit enables rapid development of professional-quality command-line tools with proper architecture, documentation, and user experience.