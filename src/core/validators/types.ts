/**
 * Validator plugin architecture types and interfaces
 */

export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  HINT = 'hint'
}

export interface ValidationIssue {
  severity: ValidationSeverity;
  message: string;
  line?: number | undefined;
  column?: number | undefined;
  rule: string;
  fix?: string | undefined;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  metadata?: Record<string, unknown>;
}

export interface ValidationContext {
  filePath: string;
  projectRoot: string;
  content: string;
  options?: Record<string, unknown> | undefined;
}

export interface ValidationRule {
  name: string;
  description: string;
  validate(context: ValidationContext): ValidationResult | Promise<ValidationResult>;
}

export interface ValidatorPlugin {
  name: string;
  version: string;
  rules: ValidationRule[];
  configure?(options: Record<string, unknown>): void;
}

export interface ValidatorRegistry {
  register(plugin: ValidatorPlugin): void;
  getPlugin(name: string): ValidatorPlugin | undefined;
  getAllPlugins(): ValidatorPlugin[];
  getRule(ruleName: string): ValidationRule | undefined;
  getAllRules(): ValidationRule[];
}

export interface ValidationOptions {
  strict?: boolean | undefined;
  rules?: string[] | undefined;
  exclude?: string[] | undefined;
  fix?: boolean | undefined;
  parallel?: boolean | undefined;
}

export interface ValidationReport {
  filePath: string;
  valid: boolean;
  issues: ValidationIssue[];
  executionTime: number;
  validator: string;
}

export interface ValidationSummary {
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  totalIssues: number;
  issuesBySeverity: Record<ValidationSeverity, number>;
  reports: ValidationReport[];
  executionTime: number;
}