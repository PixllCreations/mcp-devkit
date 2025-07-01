import { ValidationRule, ValidationContext, ValidationResult, ValidationIssue, ValidationSeverity } from './types.js';

/**
 * Base class for validation rules
 */
export abstract class BaseValidationRule implements ValidationRule {
  constructor(
    public readonly name: string,
    public readonly description: string
  ) {}

  abstract validate(context: ValidationContext): ValidationResult | Promise<ValidationResult>;

  /**
   * Helper method to create a validation result
   */
  protected createResult(valid: boolean, issues: ValidationIssue[] = []): ValidationResult {
    return { valid, issues };
  }

  /**
   * Helper method to create a validation issue
   */
  protected createIssue(
    message: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR,
    line?: number | undefined,
    column?: number | undefined,
    fix?: string | undefined
  ): ValidationIssue {
    return {
      severity,
      message,
      line,
      column,
      rule: this.name,
      fix
    };
  }

  /**
   * Helper method to find line number for a position in text
   */
  protected getLineNumber(content: string, position: number): number {
    const lines = content.substring(0, position).split('\n');
    return lines.length;
  }

  /**
   * Helper method to find column number for a position in text
   */
  protected getColumnNumber(content: string, position: number): number {
    const lines = content.substring(0, position).split('\n');
    const lastLine = lines[lines.length - 1];
    return (lastLine?.length ?? 0) + 1;
  }
}