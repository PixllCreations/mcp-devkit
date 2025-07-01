import { ValidatorPlugin } from './types.js';
import { SchemaValidator } from './schema-validator.js';
import { MarkdownValidator } from './markdown-validator.js';

/**
 * Built-in validator plugin containing core validation rules
 */
export class BuiltinValidatorPlugin implements ValidatorPlugin {
  public readonly name = 'builtin';
  public readonly version = '1.0.0';
  public readonly rules = [
    new SchemaValidator(),
    new MarkdownValidator()
  ];

  configure(_options: Record<string, unknown>): void {
    // Built-in plugin doesn't need configuration
    // Individual rules can be configured through validation options
  }
}

export const builtinPlugin = new BuiltinValidatorPlugin();