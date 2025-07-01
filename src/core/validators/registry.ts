import { ValidatorPlugin, ValidatorRegistry, ValidationRule } from './types.js';

/**
 * Registry for validator plugins and rules
 */
export class DefaultValidatorRegistry implements ValidatorRegistry {
  private plugins = new Map<string, ValidatorPlugin>();
  private rules = new Map<string, ValidationRule>();

  register(plugin: ValidatorPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Validator plugin '${plugin.name}' is already registered`);
    }

    this.plugins.set(plugin.name, plugin);

    // Register all rules from the plugin
    for (const rule of plugin.rules) {
      const ruleKey = `${plugin.name}/${rule.name}`;
      if (this.rules.has(ruleKey)) {
        throw new Error(`Validation rule '${ruleKey}' is already registered`);
      }
      this.rules.set(ruleKey, rule);
    }

    // Configure the plugin if needed
    if (plugin.configure) {
      plugin.configure({});
    }
  }

  getPlugin(name: string): ValidatorPlugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): ValidatorPlugin[] {
    return Array.from(this.plugins.values());
  }

  getRule(ruleName: string): ValidationRule | undefined {
    // Try direct lookup first
    if (this.rules.has(ruleName)) {
      return this.rules.get(ruleName);
    }

    // If not found, try without plugin prefix
    for (const [key, rule] of this.rules) {
      if (key.endsWith(`/${ruleName}`)) {
        return rule;
      }
    }

    return undefined;
  }

  getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get all rule names with their plugin prefixes
   */
  getAllRuleNames(): string[] {
    return Array.from(this.rules.keys());
  }

  /**
   * Clear all registered plugins and rules
   */
  clear(): void {
    this.plugins.clear();
    this.rules.clear();
  }
}

// Create and export a singleton instance
export const validatorRegistry = new DefaultValidatorRegistry();