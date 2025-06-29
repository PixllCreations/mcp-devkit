// Core project types
export interface ProjectConfig {
  name: string;
  version: string;
  description?: string;
  template: string;
  created: string;
  lastModified: string;
  phase: ProjectPhase;
  agents: AgentConfig;
}

export type ProjectPhase = 'planning' | 'refining' | 'implementing' | 'testing' | 'deploying' | 'complete';

export interface AgentConfig {
  claude: AgentSettings;
  gpt4: AgentSettings;
  gemini: AgentSettings;
}

export interface AgentSettings {
  enabled: boolean;
  role: AgentRole;
  lastUsed?: string;
}

export type AgentRole = 'architect' | 'enhancer' | 'reviewer' | 'validator';

// Template types
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  required: boolean;
  default?: string | number | boolean;
  options?: string[]; // for select type
}

export interface Template {
  name: string;
  description: string;
  version: string;
  variables: TemplateVariable[];
  files: TemplateFile[];
}

export interface TemplateFile {
  source: string;
  destination: string;
  variables?: Record<string, unknown>;
}

// MCP types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPResource {
  uri: string;
  name: string;
  mimeType?: string;
  description?: string;
}

// CLI types
export interface CLIOptions {
  verbose?: boolean;
  quiet?: boolean;
  force?: boolean;
  template?: string;
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  file: string;
  line?: number;
  column?: number;
  message: string;
  code: string;
}

export interface ValidationWarning {
  file: string;
  line?: number;
  column?: number;
  message: string;
  code: string;
}