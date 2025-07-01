import { Command } from 'commander';
import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import { Validator, ValidationSeverity, validatorRegistry, builtinPlugin } from '../../core/validators/index.js';
import { logger } from '../../utils/logger.js';

export function createValidateCommand(): Command {
  const command = new Command('validate');
  
  command
    .description('Validate project files against rules and schemas')
    .argument('[path]', 'Path to validate (defaults to .mcp directory)', '.mcp')
    .option('-s, --strict', 'Fail on warnings as well as errors', false)
    .option('-f, --format <format>', 'Output format: table, json, markdown', 'table')
    .option('-r, --rules <rules...>', 'Specific rules to run (space-separated)')
    .option('-e, --exclude <patterns...>', 'File patterns to exclude')
    .option('--no-parallel', 'Disable parallel processing')
    .option('--fix', 'Apply automatic fixes where possible')
    .action(async (path: string, options) => {
      try {
        await runValidation(path, options);
      } catch (error) {
        logger.error('Validation failed:', error);
        process.exit(1);
      }
    });

  return command;
}

interface ValidateOptions {
  strict: boolean;
  format: 'table' | 'json' | 'markdown';
  rules?: string[];
  exclude?: string[];
  parallel: boolean;
  fix: boolean;
}

async function runValidation(targetPath: string, options: ValidateOptions) {
  const cwd = process.cwd();
  const fullPath = join(cwd, targetPath);

  // Check if path exists
  if (!existsSync(fullPath)) {
    logger.error(`Path does not exist: ${fullPath}`);
    process.exit(1);
  }

  // Register built-in validator plugin
  validatorRegistry.register(builtinPlugin);

  // Create validator with options
  const validator = new Validator({
    strict: options.strict,
    rules: options.rules || undefined,
    exclude: options.exclude || undefined,
    parallel: options.parallel,
    fix: options.fix
  });

  // Show which rules will be run
  const rulesToRun = validatorRegistry.getAllRules();
  if (options.rules && options.rules.length > 0) {
    logger.info(`Running specific rules: ${options.rules.join(', ')}`);
  } else {
    logger.info(`Running ${rulesToRun.length} validation rules`);
  }

  // Run validation
  const startTime = Date.now();
  const summary = await validator.validateProject(cwd);
  const duration = Date.now() - startTime;

  // Output results
  switch (options.format) {
    case 'json':
      console.log(JSON.stringify(summary, null, 2));
      break;
    case 'markdown':
      outputMarkdownReport(summary);
      break;
    default:
      outputTableReport(summary);
      break;
  }

  // Show summary
  console.log();
  console.log(formatSummary(summary, duration));

  // Exit with appropriate code
  const hasErrors = summary.issuesBySeverity[ValidationSeverity.ERROR] > 0;
  const hasWarnings = summary.issuesBySeverity[ValidationSeverity.WARNING] > 0;
  
  if (hasErrors || (options.strict && hasWarnings)) {
    process.exit(1);
  }
}

function outputTableReport(summary: any) {
  if (summary.reports.length === 0) {
    console.log(chalk.yellow('No files found to validate'));
    return;
  }

  // Group reports by file
  for (const report of summary.reports) {
    if (report.issues.length === 0) {
      if (process.env['NODE_ENV'] !== 'test') {
        console.log(`${chalk.green('✓')} ${report.filePath}`);
      }
      continue;
    }

    console.log(`${chalk.red('✗')} ${chalk.bold(report.filePath)}`);
    
    for (const issue of report.issues) {
      const severity = getSeverityIcon(issue.severity);
      const location = issue.line ? `:${issue.line}${issue.column ? `:${issue.column}` : ''}` : '';
      const fix = issue.fix ? chalk.dim(` (${issue.fix})`) : '';
      
      console.log(`  ${severity} ${issue.message}${location}${fix}`);
    }
    console.log();
  }
}

function outputMarkdownReport(summary: any) {
  console.log('# Validation Report\n');
  
  if (summary.reports.length === 0) {
    console.log('No files found to validate.\n');
    return;
  }

  // Summary table
  console.log('## Summary\n');
  console.log('| Metric | Count |');
  console.log('|--------|-------|');
  console.log(`| Total Files | ${summary.totalFiles} |`);
  console.log(`| Valid Files | ${summary.validFiles} |`);
  console.log(`| Files with Issues | ${summary.invalidFiles} |`);
  console.log(`| Total Issues | ${summary.totalIssues} |`);
  console.log(`| Errors | ${summary.issuesBySeverity.error} |`);
  console.log(`| Warnings | ${summary.issuesBySeverity.warning} |`);
  console.log(`| Info | ${summary.issuesBySeverity.info} |`);
  console.log(`| Hints | ${summary.issuesBySeverity.hint} |`);
  console.log();

  // Issues by file
  const filesWithIssues = summary.reports.filter((r: any) => r.issues.length > 0);
  if (filesWithIssues.length > 0) {
    console.log('## Issues by File\n');
    
    for (const report of filesWithIssues) {
      console.log(`### ${report.filePath}\n`);
      
      for (const issue of report.issues) {
        const location = issue.line ? `:${issue.line}${issue.column ? `:${issue.column}` : ''}` : '';
        console.log(`- **${issue.severity.toUpperCase()}**${location}: ${issue.message}`);
        if (issue.fix) {
          console.log(`  - *Suggested fix: ${issue.fix}*`);
        }
      }
      console.log();
    }
  }
}

function formatSummary(summary: any, duration: number): string {
  const lines = [];
  
  lines.push(chalk.bold('Validation Summary'));
  lines.push('─'.repeat(50));
  
  lines.push(`Files processed: ${summary.totalFiles}`);
  lines.push(`Valid files: ${chalk.green(summary.validFiles)}`);
  lines.push(`Files with issues: ${summary.invalidFiles > 0 ? chalk.red(summary.invalidFiles) : '0'}`);
  lines.push(`Total issues: ${summary.totalIssues}`);
  
  if (summary.totalIssues > 0) {
    lines.push('');
    lines.push('Issues by severity:');
    if (summary.issuesBySeverity.error > 0) {
      lines.push(`  ${chalk.red('●')} Errors: ${summary.issuesBySeverity.error}`);
    }
    if (summary.issuesBySeverity.warning > 0) {
      lines.push(`  ${chalk.yellow('●')} Warnings: ${summary.issuesBySeverity.warning}`);
    }
    if (summary.issuesBySeverity.info > 0) {
      lines.push(`  ${chalk.blue('●')} Info: ${summary.issuesBySeverity.info}`);
    }
    if (summary.issuesBySeverity.hint > 0) {
      lines.push(`  ${chalk.gray('●')} Hints: ${summary.issuesBySeverity.hint}`);
    }
  }
  
  lines.push('');
  lines.push(`Completed in ${duration}ms`);
  
  return lines.join('\n');
}

function getSeverityIcon(severity: ValidationSeverity): string {
  switch (severity) {
    case ValidationSeverity.ERROR:
      return chalk.red('✗');
    case ValidationSeverity.WARNING:  
      return chalk.yellow('⚠');
    case ValidationSeverity.INFO:
      return chalk.blue('ℹ');
    case ValidationSeverity.HINT:
      return chalk.gray('💡');
    default:
      return '•';
  }
}