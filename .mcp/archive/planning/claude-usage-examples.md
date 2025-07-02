# Claude Usage Examples with mcp-devkit

## 🎯 Real-World Claude Workflow Scenarios

### Scenario 1: Starting a New Project

**User**: "I want to build a SaaS application for team task management"

**Claude**: "I'll use mcp-devkit to set up a structured development process for this SaaS application."

```typescript
// Claude calls MCP tool
await mcp_init_guided({
  projectType: "saas-web-app",
  requirements: "team task management with auth, real-time updates, billing"
})
```

**mcp-devkit Response**:
```json
{
  "projectInitialized": true,
  "developmentPlan": {
    "phases": [
      {
        "name": "Foundation",
        "duration": "1 week", 
        "tasks": ["Setup Next.js + TypeScript", "Database design", "Auth system"]
      },
      {
        "name": "Core Features",
        "duration": "2 weeks",
        "tasks": ["Task CRUD", "Team management", "Real-time updates"]
      },
      {
        "name": "Business Features", 
        "duration": "1 week",
        "tasks": ["Billing integration", "Usage analytics", "Admin dashboard"]
      }
    ]
  },
  "nextTask": {
    "id": "setup-nextjs",
    "description": "Initialize Next.js project with TypeScript and Tailwind",
    "estimatedTime": "30 minutes"
  }
}
```

**Claude**: "Perfect! I've created a 3-phase development plan. The multi-agent team has refined the architecture and we're ready to start. 

Let me begin with Phase 1, Task 1: Setting up the Next.js foundation..."

---

### Scenario 2: Mid-Development Progress Check

*After several hours of development*

**Claude**: "Before I continue with the authentication system, let me check our progress..."

```typescript
await mcp_get_status({ projectPath: "./saas-app" })
```

**mcp-devkit Response**:
```json
{
  "currentPhase": "Foundation",
  "progress": "65%",
  "completedTasks": [
    "setup-nextjs",
    "database-schema", 
    "basic-auth-structure"
  ],
  "currentTask": "implement-jwt-auth",
  "nextSteps": [
    "Add password hashing with bcrypt",
    "Implement JWT refresh tokens",
    "Create protected route middleware"
  ],
  "blockers": [],
  "estimatedTimeToPhaseCompletion": "4 hours"
}
```

**Claude**: "Excellent! We're 65% through the Foundation phase. I've completed the Next.js setup and database schema. Currently working on JWT authentication.

The plan shows I should add password hashing next. Let me implement that now..."

---

### Scenario 3: Getting Technical Review Without Context Loss

**Claude**: "This authentication approach needs a technical review before I proceed..."

```typescript
await mcp_technical_review({
  component: "jwt-auth-system",
  reviewType: "security",
  currentImplementation: "Using jose library with 15min access tokens, 7day refresh tokens"
})
```

**mcp-devkit Response** (after GPT-4 analysis):
```json
{
  "reviewer": "GPT-4",
  "assessment": "secure",
  "recommendations": [
    "Add rate limiting for auth endpoints",
    "Store refresh tokens in httpOnly cookies",
    "Implement token blacklisting for logout",
    "Add CSRF protection for refresh endpoint"
  ],
  "securityScore": 85,
  "criticalIssues": [],
  "suggestedImprovements": [
    "Consider adding 2FA support in next phase",
    "Implement session management for enterprise users"
  ]
}
```

**Claude**: "GPT-4 has reviewed the auth system and it's fundamentally secure with an 85/100 score. Key recommendations:
- Add rate limiting (I'll implement this now)
- Use httpOnly cookies for refresh tokens (good suggestion)
- Add token blacklisting for proper logout

Let me implement these improvements..."

---

### Scenario 4: Project Recovery (Picking up abandoned project)

**User**: "I started this React project months ago but got completely lost. Can you help me finish it?"

**Claude**: "I'll analyze your existing project and create a recovery plan."

```typescript
await mcp_analyze_project({
  projectPath: "./abandoned-react-app", 
  analysisType: "stalled"
})
```

**mcp-devkit Response**:
```json
{
  "projectStatus": "stalled",
  "lastActivity": "3 months ago",
  "completionPercentage": 45,
  "identifiedComponents": [
    "React setup with TypeScript ✓",
    "Basic routing with React Router ✓", 
    "Component library setup ✓",
    "State management - INCOMPLETE",
    "API integration - NOT STARTED",
    "Authentication - NOT STARTED"
  ],
  "stuckPoint": "state-management-complexity",
  "recommendations": {
    "quickWins": [
      "Replace Redux with Zustand for simpler state management",
      "Complete the user profile component that's 80% done"
    ],
    "blockerResolution": "The state management got overly complex. Zustand will simplify this significantly.",
    "estimatedTimeToCompletion": "2-3 weeks"
  },
  "recoveryPlan": {
    "phase1": "Simplify state management (3 days)",
    "phase2": "Complete core features (1 week)", 
    "phase3": "Add authentication and deploy (1 week)"
  }
}
```

**Claude**: "I can see exactly what happened! Your React app is 45% complete with good fundamentals, but you got stuck on Redux complexity. 

Here's my recovery plan:
1. **Replace Redux with Zustand** (much simpler state management)
2. **Complete the user profile component** (it's already 80% done!)
3. **Add the missing API integration and auth**

Let me start by simplifying your state management. This should resolve the blocker that stopped progress..."

---

### Scenario 5: Checking for Drift

*After a long conversation about different approaches*

**Claude**: "Wait, let me make sure I'm not drifting from our development plan..."

```typescript
await mcp_check_drift({
  currentDiscussion: "debating between PostgreSQL vs MongoDB for the task management data",
  sessionLength: 45 // minutes
})
```

**mcp-devkit Response**:
```json
{
  "isDrifting": true,
  "driftType": "over-architecture",
  "originalPlan": "Use PostgreSQL as specified in Phase 1 architecture",
  "currentFocus": "database-selection-debate", 
  "recommendation": "Return to implementation. Database choice was already decided in architectural phase.",
  "suggestedAction": "Proceed with PostgreSQL setup as planned, defer optimization discussions to Phase 3"
}
```

**Claude**: "You're right - I was drifting into over-architecture! The development plan already specifies PostgreSQL. Let me get back on track and implement the database setup as planned.

I'll save the MongoDB discussion for the optimization phase if needed. Right now, let's stick to the plan and keep making progress..."

---

### Scenario 6: Natural Break Points

**Claude**: "I've been working for a while, let me check if this is a good stopping point..."

```typescript
await mcp_suggest_break({
  sessionLength: 120, // 2 hours
  tasksCompleted: 3,
  currentTaskProgress: 75
})
```

**mcp-devkit Response**:
```json
{
  "suggestBreak": true,
  "reason": "Good stopping point - current task is 75% complete",
  "completionSummary": {
    "tasksCompleted": [
      "JWT authentication setup",
      "Password hashing implementation", 
      "Protected route middleware"
    ],
    "currentProgress": "Auth system nearly complete - just testing remaining"
  },
  "nextSession": {
    "startWith": "Complete JWT auth testing",
    "estimatedTime": "20 minutes",
    "thenProceedTo": "User registration endpoint"
  },
  "sessionProductivity": "excellent"
}
```

**Claude**: "This is a perfect stopping point! I've completed the core authentication system and we're 75% through the current task. 

**Session Summary:**
✅ JWT authentication setup  
✅ Password hashing with bcrypt
✅ Protected route middleware
🔄 Auth testing (75% complete)

**Next session:** Finish the auth testing (20 min) then move to user registration.

Great progress today! The foundation phase is nearly complete."

---

## 🎯 Benefits Demonstrated

### 1. **No More Drift**
- Claude checks progress against plan
- Can detect when conversation goes off-track
- Automatic refocusing on current priorities

### 2. **Persistent Memory**
- Projects survive across sessions
- Can resume exact state from weeks/months ago
- All decisions and progress tracked

### 3. **Expert Consultation Without Context Loss**
- Get specialized AI review (GPT-4 for technical, Gemini for risks)
- Receive summaries and recommendations only
- Maintain focus on implementation

### 4. **Systematic Development**
- Every project follows proven methodology
- Clear phases with measurable progress
- Automatic next-step guidance

### 5. **Project Recovery**
- Analyze any existing codebase
- Identify exactly where things stalled
- Generate specific recovery plans

This MCP server approach transforms Claude from a helpful assistant into a **persistent development partner** with perfect memory and systematic process guidance!