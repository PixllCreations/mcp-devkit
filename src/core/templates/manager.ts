import fs from 'fs/promises';
import path from 'path';
import { Logger } from '../../utils/logger.js';

export interface TemplateMetadata {
  name: string;
  description: string;
  version: string;
  variables: Record<string, string>;
}

export class TemplateManager {
  constructor(private logger: Logger) {}

  async initializeProject(mcpPath: string, templateType: string): Promise<void> {
    this.logger.debug(`Initializing project with template: ${templateType}`);
    
    // Create .mcp directory structure
    await fs.mkdir(mcpPath, { recursive: true });
    await fs.mkdir(path.join(mcpPath, 'archive'), { recursive: true });
    
    // Create core context files
    await this.createContextFiles(mcpPath);
    
    // Create metadata file
    await this.createMetadata(mcpPath, templateType);
    
    this.logger.debug('Project initialization complete');
  }

  private async createContextFiles(mcpPath: string): Promise<void> {
    // Create PRD template
    const prdContent = `# Product Requirements Document (PRD)

> **Status**: Draft  
> **Last Updated**: ${new Date().toISOString().split('T')[0]}  
> **Version**: 1.0  

## 📋 Project Overview

### Problem Statement
Describe the problem your project solves and why it matters.

### Solution Overview
Explain your approach to solving the problem.

### Success Metrics
Define how you'll measure success.

## 👥 Target Users

### Primary Users
- Who will use this product?

### User Needs
- What do they need to accomplish?

## 🎯 Core Requirements

### Must Have (P0)
- [ ] Essential feature 1
- [ ] Essential feature 2

### Should Have (P1)
- [ ] Important feature 1
- [ ] Important feature 2

### Nice to Have (P2)
- [ ] Enhancement 1
- [ ] Enhancement 2

## 🚫 Out of Scope

### Phase 1 Exclusions
- Features to defer to later phases

## 🏁 User Stories & Acceptance Criteria

### Epic 1: [Epic Name]
**As a** [user type]  
**I want** [functionality]  
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
`;

    await fs.writeFile(path.join(mcpPath, 'context_prd.md'), prdContent);

    // Create Architecture template
    const archContent = `# Technical Architecture

> **Status**: Draft  
> **Last Updated**: ${new Date().toISOString().split('T')[0]}  
> **Version**: 1.0  

## 🏗️ System Overview

### Architecture Vision
High-level description of your system architecture.

### Key Design Principles
- Principle 1: Description
- Principle 2: Description

## 🔧 Technology Stack

### Frontend
- Framework: TBD
- Language: TBD

### Backend
- Framework: TBD
- Language: TBD
- Database: TBD

### Infrastructure
- Hosting: TBD
- CI/CD: TBD

## 📊 System Components

### Component 1
Description and responsibilities.

### Component 2
Description and responsibilities.

## 🔄 Data Flow

Describe how data flows through your system.

## 🛡️ Security Considerations

- Authentication: TBD
- Authorization: TBD
- Data protection: TBD

## 📈 Scalability & Performance

- Expected load: TBD
- Performance targets: TBD
- Scaling strategy: TBD
`;

    await fs.writeFile(path.join(mcpPath, 'context_architecture.md'), archContent);

    // Create task list template
    const taskContent = `# Development Task List

> **Status**: Draft  
> **Last Updated**: ${new Date().toISOString().split('T')[0]}  
> **Sprint**: Planning  

## 🎯 Current Sprint

### Sprint Goal
Define what you want to accomplish in this sprint.

### Sprint Backlog
- [ ] **TASK-001**: Task description (Story Points: X)
- [ ] **TASK-002**: Task description (Story Points: X)

## 📋 Backlog

### High Priority
- [ ] Important task 1
- [ ] Important task 2

### Medium Priority
- [ ] Useful task 1
- [ ] Useful task 2

### Low Priority
- [ ] Nice to have 1
- [ ] Nice to have 2

## ✅ Completed Tasks

### Sprint 0: Planning
- [x] Initialize project structure
- [x] Create planning documents

## 📊 Progress Tracking

| Sprint | Story Points | Completed | Remaining |
|--------|-------------|-----------|-----------|
| 1 | TBD | 0 | TBD |

## 🚧 Blockers & Risks

- Blocker 1: Description and mitigation plan
- Risk 1: Description and probability
`;

    await fs.writeFile(path.join(mcpPath, 'context_tasklist.md'), taskContent);
  }

  private async createMetadata(mcpPath: string, templateType: string): Promise<void> {
    const metadata = {
      projectName: path.basename(path.dirname(mcpPath)),
      templateType,
      version: '0.1.0',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      mcpDevkitVersion: '0.1.0',
      phase: 'planning',
      agents: {
        claude: { enabled: true, role: 'architect' },
        gpt4: { enabled: false, role: 'enhancer' },
        gemini: { enabled: false, role: 'reviewer' }
      }
    };

    await fs.writeFile(
      path.join(mcpPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
  }
}