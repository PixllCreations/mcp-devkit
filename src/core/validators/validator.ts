import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { join, relative } from 'path';
import { performance } from 'perf_hooks';
import pLimit from 'p-limit';
import { 
  ValidationOptions, 
  ValidationReport, 
  ValidationSummary, 
  ValidationContext,
  ValidationSeverity
} from './types.js';
import { validatorRegistry } from './registry.js';
import { logger } from '../../utils/logger.js';

/**
 * Main validator class that runs validation rules on files
 */
export class Validator {
  private options: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      strict: false,
      parallel: true,
      ...options
    };
  }

  /**
   * Validate a single file
   */
  async validateFile(filePath: string, projectRoot: string): Promise<ValidationReport> {
    const startTime = performance.now();
    const content = await readFile(filePath, 'utf-8');
    
    const context: ValidationContext = {
      filePath,
      projectRoot,
      content,
      options: this.options as Record<string, unknown>
    };

    const issues: ValidationReport['issues'] = [];
    let hasErrors = false;

    // Get rules to run
    const rulesToRun = this.getRulesToRun();

    // Run each rule
    for (const rule of rulesToRun) {
      try {
        const result = await rule.validate(context);
        issues.push(...result.issues);
        
        if (!result.valid && result.issues.some(i => i.severity === ValidationSeverity.ERROR)) {
          hasErrors = true;
        }
      } catch (error) {
        logger.error(`Error running rule ${rule.name} on ${filePath}:`, error);
        issues.push({
          severity: ValidationSeverity.ERROR,
          message: `Rule ${rule.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          rule: rule.name
        });
        hasErrors = true;
      }
    }

    const executionTime = performance.now() - startTime;

    return {
      filePath: relative(projectRoot, filePath),
      valid: !hasErrors && (!this.options.strict || issues.length === 0),
      issues,
      executionTime,
      validator: 'mcp-devkit'
    };
  }

  /**
   * Validate multiple files
   */
  async validateFiles(pattern: string, projectRoot: string): Promise<ValidationSummary> {
    const startTime = performance.now();
    
    // Find files matching pattern
    const files = await glob(pattern, {
      cwd: projectRoot,
      absolute: true,
      nodir: true,
      ignore: this.options.exclude || []
    });

    if (files.length === 0) {
      logger.warn(`No files found matching pattern: ${pattern}`);
      return this.createEmptySummary();
    }

    // Set up parallel processing
    const limit = this.options.parallel ? pLimit(5) : pLimit(1);
    
    // Validate each file
    const reports = await Promise.all(
      files.map(file => limit(() => this.validateFile(file, projectRoot)))
    );

    // Calculate summary
    const summary: ValidationSummary = {
      totalFiles: reports.length,
      validFiles: reports.filter(r => r.valid).length,
      invalidFiles: reports.filter(r => !r.valid).length,
      totalIssues: reports.reduce((sum, r) => sum + r.issues.length, 0),
      issuesBySeverity: {
        [ValidationSeverity.ERROR]: 0,
        [ValidationSeverity.WARNING]: 0,
        [ValidationSeverity.INFO]: 0,
        [ValidationSeverity.HINT]: 0
      },
      reports,
      executionTime: performance.now() - startTime
    };

    // Count issues by severity
    for (const report of reports) {
      for (const issue of report.issues) {
        summary.issuesBySeverity[issue.severity]++;
      }
    }

    return summary;
  }

  /**
   * Validate the entire project
   */
  async validateProject(projectRoot: string): Promise<ValidationSummary> {
    const pattern = join(projectRoot, '.mcp', '**', '*.md');
    return this.validateFiles(pattern, projectRoot);
  }

  /**
   * Get the list of rules to run based on options
   */
  private getRulesToRun() {
    let rules = validatorRegistry.getAllRules();

    // Filter by included rules
    if (this.options.rules && this.options.rules.length > 0) {
      rules = rules.filter(rule => {
        const ruleName = rule.name;
        return this.options.rules!.some(pattern => {
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(ruleName);
          }
          return ruleName === pattern || ruleName.endsWith(`/${pattern}`);
        });
      });
    }

    return rules;
  }

  /**
   * Create an empty summary
   */
  private createEmptySummary(): ValidationSummary {
    return {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      totalIssues: 0,
      issuesBySeverity: {
        [ValidationSeverity.ERROR]: 0,
        [ValidationSeverity.WARNING]: 0,
        [ValidationSeverity.INFO]: 0,
        [ValidationSeverity.HINT]: 0
      },
      reports: [],
      executionTime: 0
    };
  }
}