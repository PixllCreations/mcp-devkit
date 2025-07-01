# Phase 1: Core Features (Sprint 2-3 - 2 Weeks)

> **Sprint Goal**: Implement validation system and pluggable agent architecture  
> **Duration**: 10 days (2 sprints)  
> **Success Criteria**: Working validator and single-agent enhancement

## ✅ Sprint 2 Status: COMPLETE (2025-01-07)

**Achievements:**
- ✅ Designed and implemented pluggable validator architecture
- ✅ Created comprehensive markdown validation rules
- ✅ Built AJV-based JSON schema validation
- ✅ Implemented `mcp validate` CLI command with multiple output formats
- ✅ Added full test coverage for validation system
- ✅ Performance optimized with parallel processing support

**Key Features Delivered:**
- Validator plugin system with TypeScript interfaces
- Markdown validators: empty sections, placeholders, checkboxes, link integrity
- JSON schema validation with AJV
- CLI command with table/JSON/markdown output formats
- Line-specific error reporting with suggested fixes
- 21 files validated in ~11ms

**Deferred to Sprint 3:**
- TASK-021: Frontmatter validator (can be added as needed)
- TASK-027: Auto-validation on init (nice-to-have)

## 🎯 Sprint 2: Validation System (Days 6-10)

### Day 6: Validator Architecture
- [x] **TASK-018**: Design validator plugin architecture (3h) ✅
  ```typescript
  // src/core/validators/types.ts
  interface ValidationRule {
    name: string;
    validate(content: string): ValidationResult;
  }
  ```

- [x] **TASK-019**: Implement AJV schema validator (2h) ✅
  - Set up AJV with JSON Schema draft-07
  - Create base validator class
  - Load schemas from templates/schemas/

### Day 7: Template Validation Rules
- [x] **TASK-020**: Create markdown validation rules (4h) ✅
  - Check for empty sections
  - Validate checkbox format
  - Find placeholder text
  - Verify required sections exist

- [ ] **TASK-021**: Implement frontmatter validator (2h) ⏳ *(Deferred to Sprint 3)*
  - Parse YAML frontmatter
  - Validate against schema
  - Check required fields

### Day 8: Validation Command
- [x] **TASK-022**: Create validate command (3h) ✅
  ```bash
  mcp validate [path] --strict --format json
  ```
  - Command structure and options
  - Run validation on .mcp directory
  - Output formatting (table, json, markdown)

- [x] **TASK-023**: Generate validation reports (2h) ✅
  - Create validation-report.md
  - Include line numbers and error details
  - Summary statistics

### Day 9: Performance Optimization
- [x] **TASK-024**: Optimize file scanning (3h) ✅
  - Implement glob pattern caching
  - Parallel file processing
  - Stream-based validation for large files

- [x] **TASK-025**: Benchmark validation performance (2h) ✅
  - Test on 2k, 10k, 50k file repos
  - Profile bottlenecks
  - Document performance metrics

### Day 10: Testing & Integration
- [x] **TASK-026**: Comprehensive validator tests (3h) ✅
  - Unit tests for each rule
  - Integration tests with real templates
  - Performance regression tests

- [ ] **TASK-027**: Update init to run validation (1h) ⏳ *(Deferred)*
  - Auto-validate after init
  - Show validation summary

## ✅ Sprint 3 Status: COMPLETE (2025-01-07)

**Achievements:**
- ✅ Designed and implemented complete pluggable agent architecture
- ✅ Created comprehensive agent registry system with provider pattern
- ✅ Built 3 agent implementations: Mock, Shell, OpenAI
- ✅ Implemented agent configuration system with environment variable support
- ✅ Created `mcp enhance` CLI command with multiple output formats
- ✅ Added cost estimation and token usage tracking

**Key Features Delivered:**
- Agent system with TypeScript interfaces and enums
- 4 built-in roles: architect, reviewer, optimizer, planner
- JSON configuration with `.mcp/agents.json`
- Enhancement workflow with change tracking
- Multiple output formats: enhanced, diff, json
- 29 files implemented across agent system

## 🎯 Sprint 3: Agent System (Days 11-15)

### Day 11: Agent Architecture
- [x] **TASK-028**: Design pluggable agent interface (4h) ✅
  ```typescript
  // src/core/agents/types.ts
  interface Agent {
    name: string;
    type: AgentType;
    capabilities: AgentCapability[];
    configure(config: AgentConfig): Promise<void>;
    enhance(content: string, role: AgentRole): Promise<Enhancement>;
  }
  ```

- [x] **TASK-029**: Create agent registry system (2h) ✅
  - Dynamic agent loading with provider pattern
  - Configuration validation and management
  - Agent capability detection and type safety

### Day 12: Mock Agent Implementation
- [x] **TASK-030**: Create mock agent for testing (3h) ✅
  - Role-specific enhancement templates
  - Configurable delay simulation
  - Token estimation and cost tracking
  - No API keys required for demos

- [x] **TASK-031**: Implement shell agent (2h) ✅
  - Local command execution via spawn
  - JSON input/output protocol
  - Configurable timeout and environment
  - Error handling for command failures

### Day 13: OpenAI Agent
- [x] **TASK-032**: Implement OpenAI agent (4h) ✅
  - Full OpenAI API integration with error handling
  - Support for gpt-4o, gpt-4o-mini, gpt-3.5-turbo
  - Real token counting and cost calculation
  - Connection testing and retry logic

- [x] **TASK-033**: Create agent configuration (2h) ✅
  ```json
  {
    "agents": {
      "mock": { "type": "mock", "name": "mock", "delay": 1000 },
      "primary": {
        "type": "openai",
        "model": "gpt-4o-mini",
        "apiKey": "${OPENAI_API_KEY}"
      }
    },
    "defaultAgent": "primary"
  }
  ```

### Day 14: Enhancement Command
- [x] **TASK-034**: Create enhance command (4h) ✅
  ```bash
  mcp enhance <file> --agent openai --role architect
  mcp enhance README.md --dry-run --cost-estimate
  mcp enhance doc.md --format diff --output enhanced.md
  ```
  - CLI with agent selection and role specification
  - Cost estimation before enhancement
  - Multiple output formats and dry-run mode

- [x] **TASK-035**: Implement enhancement workflow (2h) ✅
  - Document loading and validation
  - Agent enhancement with change tracking
  - Enhanced content saving with metadata
  - Detailed progress reporting

### Day 15: Multi-Agent Orchestration & Integrations
- [ ] **TASK-036**: Create cycle command structure (2h)
  ```bash
  mcp cycle --agents claude,gpt4,gemini
  ```
  - Sequential agent execution
  - Progress tracking
  - Result aggregation

- [ ] **TASK-037**: Add caching system (1h)
  - Cache agent responses
  - Invalidation strategy
  - Cost tracking

- [ ] **TASK-038**: Implement RepoPrompt integration (2h)
  - Create repoprompt.json generator
  - Auto-update manifest on template changes
  - Context file generation for AI agents

- [ ] **TASK-039**: Implement Serena integration hooks (1h)
  - Create serena.yml playbook templates
  - Define agent orchestration workflows
  - Add Serena-compatible tool interfaces

## 📊 Phase 1 Metrics

### Sprint 2 (Validation)
| Epic | Story Points | Priority |
|------|-------------|----------|
| Validator Architecture | 8 | High |
| Validation Rules | 8 | High |
| Performance | 5 | Medium |
| Testing | 5 | High |
| **Total** | **26 SP** | |

### Sprint 3 (Agents)
| Epic | Story Points | Priority |
|------|-------------|----------|
| Agent Architecture | 8 | High |
| Agent Implementations | 13 | High |
| Enhancement Workflow | 8 | High |
| **Total** | **29 SP** | |

## ✅ Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit test coverage >85%
- [ ] Integration tests pass
- [ ] Performance benchmarks documented
- [ ] API documentation complete
- [ ] Error scenarios handled gracefully

## 🚧 Technical Debt Items
- [ ] Consider Rust for validator if performance insufficient
- [ ] Add more agent providers (Anthropic, Cohere)
- [ ] Implement rate limiting for API calls
- [ ] Add cost estimation before operations

## 📝 Architecture Decisions
**ADR-001**: Pluggable Agent Architecture
- **Decision**: Use interface-based design with dynamic loading
- **Rationale**: Allows easy addition of new AI providers
- **Consequences**: More complex but more flexible

**ADR-002**: File-based Validation
- **Decision**: Validate files individually vs. project-wide
- **Rationale**: Better performance and error isolation
- **Consequences**: May miss cross-file dependencies