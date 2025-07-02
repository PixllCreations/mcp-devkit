#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initCommand } from './commands/init.js';
import { createDemoCommand } from './commands/demo.js';
import { createStatusCommand } from './commands/status.js';
import { createServeCommand } from './commands/serve.js';

// Get version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
const version = packageJson.version;

const program = new Command();

// Configure the main CLI program
program
  .name('mcp-devkit')
  .description(chalk.bold("Claude's Persistent Development Partner") + '\n\n' +
    '  An MCP server that prevents context drift and maintains project\n' +
    '  memory across all Claude development sessions.\n\n' +
    chalk.dim('  Learn more: https://github.com/escott/mcp-devkit'))
  .version(version, '-v, --version', 'Display version number')
  .option('--verbose', 'Enable verbose logging')
  .option('--quiet', 'Suppress non-essential output')
  .helpOption('-h, --help', 'Display help for command')
  .addHelpText('before', chalk.cyan(`
  ███╗   ███╗ ██████╗██████╗       ██████╗ ███████╗██╗   ██╗██╗  ██╗██╗████████╗
  ████╗ ████║██╔════╝██╔══██╗      ██╔══██╗██╔════╝██║   ██║██║ ██╔╝██║╚══██╔══╝
  ██╔████╔██║██║     ██████╔╝█████╗██║  ██║█████╗  ██║   ██║█████╔╝ ██║   ██║   
  ██║╚██╔╝██║██║     ██╔═══╝ ╚════╝██║  ██║██╔══╝  ╚██╗ ██╔╝██╔═██╗ ██║   ██║   
  ██║ ╚═╝ ██║╚██████╗██║           ██████╔╝███████╗ ╚████╔╝ ██║  ██╗██║   ██║   
  ╚═╝     ╚═╝ ╚═════╝╚═╝           ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝   ╚═╝   
  `))
  .addHelpText('after', '\n' + chalk.bold('Examples:') + '\n' +
    chalk.gray('  # Initialize a new project\n') +
    '  $ mcp-devkit init my-project\n\n' +
    chalk.gray('  # Run interactive demo\n') +
    '  $ mcp-devkit demo\n\n' +
    chalk.gray('  # Start MCP server for Claude Desktop\n') +
    '  $ mcp-devkit serve\n\n' +
    chalk.gray('  # Check project status\n') +
    '  $ mcp-devkit status\n');

// Global error handler
program.exitOverride((err) => {
  if (err.code === 'commander.help' || err.code === 'commander.version' || err.message === '(outputHelp)') {
    process.exit(0);
  }
  
  console.error('\n' + chalk.red('✖ Error:'), err.message);
  console.error(chalk.dim('\nFor help, run: mcp-devkit --help\n'));
  process.exit(1);
});

// Add commands
program.addCommand(initCommand);
program.addCommand(createDemoCommand());
program.addCommand(createStatusCommand());
program.addCommand(createServeCommand());

// Handle unknown commands
program.on('command:*', () => {
  console.error('\n' + chalk.red('✖ Unknown command:'), chalk.yellow(program.args.join(' ')));
  console.error('\nAvailable commands:');
  console.error(chalk.gray('  init [directory]  ') + 'Initialize a new mcp-devkit project');
  console.error(chalk.gray('  demo              ') + 'Run interactive demonstration');
  console.error(chalk.gray('  serve             ') + 'Start MCP server for Claude Desktop');
  console.error(chalk.gray('  status            ') + 'Check project status');
  console.error('\nRun ' + chalk.cyan('mcp-devkit --help') + ' for more information.\n');
  process.exit(1);
});

// Parse arguments and execute
try {
  program.parse();
} catch (error) {
  console.error('\n' + chalk.red('✖ Unexpected error:'));
  console.error(chalk.gray('  '), error instanceof Error ? error.message : String(error));
  
  if (program.opts()['verbose'] && error instanceof Error && error.stack) {
    console.error(chalk.dim('\nStack trace:'));
    console.error(chalk.dim(error.stack));
  }
  
  console.error(chalk.dim('\nPlease report this issue: https://github.com/escott/mcp-devkit/issues\n'));
  process.exit(1);
}