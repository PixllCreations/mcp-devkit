import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { BaseValidationRule } from './base.js';
import { ValidationContext, ValidationResult, ValidationSeverity } from './types.js';
import { logger } from '../../utils/logger.js';

/**
 * AJV-based schema validator for JSON documents
 */
export class SchemaValidator extends BaseValidationRule {
  private ajv: Ajv;
  private validators = new Map<string, ValidateFunction>();

  constructor() {
    super('schema', 'Validates JSON documents against JSON schemas');
    
    // Configure AJV
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      validateFormats: true
    });
    
    // Add format validators
    addFormats(this.ajv);
  }

  async validate(context: ValidationContext): Promise<ValidationResult> {
    try {
      // Only validate JSON files
      if (!context.filePath.endsWith('.json')) {
        return this.createResult(true);
      }

      // Parse JSON content
      let data: unknown;
      try {
        data = JSON.parse(context.content);
      } catch (error) {
        return this.createResult(false, [
          this.createIssue(
            `Invalid JSON: ${error instanceof Error ? error.message : 'Parse error'}`,
            ValidationSeverity.ERROR
          )
        ]);
      }

      // Determine schema based on file path or content
      const schemaName = this.getSchemaName(context.filePath, data);
      if (!schemaName) {
        // No schema found, consider valid
        return this.createResult(true);
      }

      // Get or load validator
      const validator = await this.getValidator(schemaName);
      if (!validator) {
        return this.createResult(false, [
          this.createIssue(
            `Schema '${schemaName}' not found`,
            ValidationSeverity.WARNING
          )
        ]);
      }

      // Validate data
      const valid = validator(data);
      if (valid) {
        return this.createResult(true);
      }

      // Convert AJV errors to validation issues
      const issues = (validator.errors || []).map(error => {
        const path = error.instancePath || error.schemaPath || '';
        const message = `${path ? `${path}: ` : ''}${error.message}`;
        
        return this.createIssue(
          message,
          ValidationSeverity.ERROR,
          undefined,
          undefined,
          this.generateFix(error)
        );
      });

      return this.createResult(false, issues);

    } catch (error) {
      logger.error(`Schema validation failed for ${context.filePath}:`, error);
      return this.createResult(false, [
        this.createIssue(
          `Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ValidationSeverity.ERROR
        )
      ]);
    }
  }

  /**
   * Get or load validator for a schema
   */
  private async getValidator(schemaName: string): Promise<ValidateFunction | null> {
    if (this.validators.has(schemaName)) {
      return this.validators.get(schemaName)!;
    }

    try {
      const schemaPath = join(__dirname, 'schemas', `${schemaName}.json`);
      const schemaContent = await readFile(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaContent);
      
      const validator = this.ajv.compile(schema);
      this.validators.set(schemaName, validator);
      
      return validator;
    } catch (error) {
      logger.debug(`Could not load schema '${schemaName}':`, error);
      return null;
    }
  }

  /**
   * Determine schema name based on file path and content
   */
  private getSchemaName(filePath: string, data: unknown): string | null {
    // Check for schema hint in data
    if (typeof data === 'object' && data !== null && '$schema' in data) {
      const schemaUrl = (data as any).$schema;
      if (typeof schemaUrl === 'string') {
        const match = schemaUrl.match(/\/([^/]+)\.json$/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }

    // Determine from file path
    if (filePath.includes('package.json')) {
      return 'package';
    }
    
    if (filePath.includes('tsconfig.json')) {
      return 'tsconfig';
    }
    
    if (filePath.includes('.vscode/settings.json')) {
      return 'vscode-settings';
    }

    if (filePath.includes('.mcp/config.json')) {
      return 'mcp-config';
    }

    return null;
  }

  /**
   * Generate a suggested fix for an AJV error
   */
  private generateFix(error: any): string | undefined {
    switch (error.keyword) {
      case 'required':
        return `Add required property: ${error.params?.missingProperty}`;
      case 'type':
        return `Expected type: ${error.params?.type}`;
      case 'enum':
        return `Must be one of: ${error.params?.allowedValues?.join(', ')}`;
      case 'format':
        return `Must match format: ${error.params?.format}`;
      default:
        return undefined;
    }
  }

  /**
   * Load a schema from file
   */
  async loadSchema(name: string, schemaPath: string): Promise<void> {
    try {
      const content = await readFile(schemaPath, 'utf-8');
      const schema = JSON.parse(content);
      const validator = this.ajv.compile(schema);
      this.validators.set(name, validator);
    } catch (error) {
      throw new Error(`Failed to load schema '${name}' from '${schemaPath}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add a schema programmatically
   */
  addSchema(name: string, schema: JSONSchemaType<any>): void {
    const validator = this.ajv.compile(schema);
    this.validators.set(name, validator);
  }
}