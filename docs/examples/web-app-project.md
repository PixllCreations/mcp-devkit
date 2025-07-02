# Example: Web App Project

This example demonstrates using mcp-devkit to build a modern React web application with TypeScript.

## Project Overview

**Goal**: Create a task management web app with user authentication, real-time updates, and responsive design.

**Tech Stack**: React, TypeScript, Vite, TailwindCSS, Firebase

## Step 1: Project Initialization

```bash
# Initialize the project
mcp-devkit init task-manager-app --template web-app

# Navigate to project
cd task-manager-app
```

**Generated Structure:**
```
task-manager-app/
├── .mcp/
│   ├── project.json
│   ├── tasks.md
│   └── templates/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── App.tsx
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Step 2: Claude Integration Workflow

### Initial Planning Session

**Claude Query**: "I want to build a task management app. Help me plan the architecture and features."

**MCP Tools Used:**
```typescript
// Get project status
await mcp_get_status({ detailed: true });

// Run multi-agent planning
await mcp_plan_refinement({
  agents: ['architect', 'reviewer'],
  focus: 'feature planning and architecture',
  iterations: 2
});
```

**Planning Output:**
- User authentication with Firebase Auth
- Real-time task synchronization with Firestore
- Responsive design with TailwindCSS
- Task categories and priorities
- Due date management
- Team collaboration features

### Architecture Review

**Claude Query**: "Review the proposed architecture for scalability and best practices."

**MCP Tools Used:**
```typescript
await mcp_technical_review({
  focus: 'architecture',
  questions: [
    'Is the component structure scalable?',
    'Are we following React best practices?',
    'How should we handle state management?'
  ]
});
```

**Review Recommendations:**
- Use React Context for global state
- Implement custom hooks for Firebase integration
- Add error boundaries for resilience
- Use React Query for server state management

## Step 3: Development Phases

### Phase 1: Foundation (Week 1)

**Tasks from mcp-devkit:**
```typescript
await mcp_next_task({ category: 'implementation', priority: 'high' });
```

1. ✅ Set up development environment
2. ✅ Configure Firebase project
3. ✅ Implement authentication system
4. ✅ Create basic routing structure
5. ✅ Design system components

**Validation Results:**
```bash
mcp-devkit validate --strict
```
```
✅ 15 files validated
⚠️  2 warnings found:
   - Missing prop types in Button component
   - Unused import in utils/date.ts
✅ No errors detected
💡 Suggestions: Add prop-types, implement error boundaries
```

### Phase 2: Core Features (Week 2)

**Drift Check:**
```typescript
await mcp_check_drift({
  currentFocus: 'implementing complex animations',
  context: 'spent 3 hours on task hover animations'
});
```

**Drift Detection Response:**
```json
{
  "isDrifting": true,
  "driftType": "scope",
  "recommendation": "Focus on core task CRUD operations first",
  "suggestedAction": "Defer animations to Phase 3 polish"
}
```

**Corrected Tasks:**
1. ✅ Task creation and editing
2. ✅ Task list with filtering
3. ✅ Real-time updates
4. ✅ Category management
5. 🔄 Priority and due date handling

### Phase 3: Polish & Deploy (Week 3)

**Performance Review:**
```typescript
await mcp_technical_review({
  focus: 'performance',
  files: ['src/components/TaskList.tsx', 'src/hooks/useTasks.ts']
});
```

**Performance Findings:**
- 🔴 TaskList re-renders on every filter change
- 🟡 Large bundle size due to date library
- ✅ Good loading state management
- 💡 Implement React.memo and useMemo optimizations

## Step 4: Document Enhancement

**Enhanced README:**
```bash
mcp-devkit enhance README.md --agent openai --role architect
```

**Before Enhancement:**
```markdown
# Task Manager App

A simple task management application.

## Installation
npm install
npm run dev
```

**After Enhancement:**
```markdown
# 🎯 TaskFlow - Modern Task Management

> Streamline your productivity with real-time collaboration and intelligent organization

[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://taskflow-demo.com)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/user/taskflow/actions)

## ✨ Features

- **🔐 Secure Authentication** - Firebase Auth with Google/GitHub login
- **⚡ Real-time Sync** - Instant updates across all devices
- **🎨 Beautiful UI** - Modern design with TailwindCSS
- **📱 Responsive** - Perfect on desktop, tablet, and mobile
- **👥 Team Collaboration** - Share projects and assign tasks
- **🏷️ Smart Organization** - Categories, priorities, and due dates

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/user/taskflow.git
cd taskflow
npm install

# Configure Firebase (see docs/setup.md)
cp .env.example .env.local
# Add your Firebase config

# Start development server
npm run dev
```

[View full documentation →](./docs/getting-started.md)
```

## Step 5: Deployment Planning

**Deployment Review:**
```typescript
await mcp_technical_review({
  focus: 'deployment',
  context: 'Planning production deployment to Vercel'
});
```

**Deployment Recommendations:**
1. **Build Optimization**:
   - Enable Vite build optimizations
   - Configure code splitting
   - Optimize bundle size

2. **Environment Setup**:
   - Production Firebase configuration
   - Environment variable management
   - Error reporting (Sentry)

3. **Performance Monitoring**:
   - Web Vitals tracking
   - Error boundary telemetry
   - User analytics

## Project Outcomes

### Metrics
- **Development Time**: 3 weeks (planned)
- **Code Quality**: 95% test coverage
- **Performance**: Lighthouse score 98/100
- **Bundle Size**: 142KB gzipped

### Benefits of mcp-devkit
1. **Prevented Scope Creep**: Drift detection saved 8+ hours
2. **Architecture Guidance**: Multi-agent review improved design
3. **Documentation**: AI-enhanced docs saved 4+ hours
4. **Quality Assurance**: Continuous validation caught 12 issues early

### Final Project Structure
```
task-manager-app/
├── .mcp/
│   ├── project.json           # Project metadata
│   ├── tasks.md              # Sprint planning
│   ├── agents.json           # AI agent config
│   └── archive/              # Development history
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Design system
│   │   ├── forms/           # Form components
│   │   └── layout/          # Layout components
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   └── useRealtime.ts
│   ├── pages/               # Route components
│   ├── services/            # Firebase integration
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Helper functions
│   └── App.tsx
├── tests/                   # Test files
├── docs/                    # Documentation
└── deployment/             # Deploy configs
```

## Lessons Learned

1. **Early Planning Saves Time**: Multi-agent architecture review prevented major refactoring
2. **Drift Detection is Crucial**: Scope creep would have added 1+ week without intervention
3. **Validation Catches Issues**: Continuous validation found issues before they became bugs
4. **AI-Enhanced Docs**: Professional documentation with minimal effort

## Next Steps

1. **Team Features**: Add user roles and permissions
2. **Mobile App**: React Native version with shared logic
3. **Analytics**: Advanced reporting and insights
4. **Integrations**: Calendar, Slack, and GitHub integrations

---

This example demonstrates how mcp-devkit transforms the development process from reactive coding to proactive, AI-guided development with persistent memory and intelligent guidance.