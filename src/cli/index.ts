#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { createValidateCommand } from './commands/validate.js';
import { createEnhanceCommand } from './commands/enhance.js';

const program = new Command();

// Configure the main CLI program
program
  .name('mcp-devkit')
  .description(chalk.bold("Claude's Persistent Development Partner") + '\n\n' +
    '  An MCP server that prevents context drift and maintains project\n' +
    '  memory across all Claude development sessions.\n\n' +
    chalk.dim('  Learn more: https://github.com/escott/mcp-devkit'))
  .version('0.1.0', '-v, --version', 'Display version number')
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
    chalk.gray('  # Start MCP server for Claude Desktop\n') +
    '  $ mcp-devkit serve\n\n' +
    chalk.gray('  # Check project status\n') +
    '  $ mcp-devkit status\n\n' +
    chalk.gray('  # Validate project files\n') +
    '  $ mcp-devkit validate\n\n' +
    chalk.gray('  # Enhance documents with AI\n') +
    '  $ mcp-devkit enhance README.md --agent gpt4 --role architect\n');

// Global error handler
program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  
  console.error('\n' + chalk.red('✖ Error:'), err.message);
  console.error(chalk.dim('\nFor help, run: mcp-devkit --help\n'));
  process.exit(1);
});

// Add commands
program.addCommand(initCommand);
program.addCommand(createValidateCommand());
program.addCommand(createEnhanceCommand());

// Handle unknown commands
program.on('command:*', () => {
  console.error('\n' + chalk.red('✖ Unknown command:'), chalk.yellow(program.args.join(' ')));
  console.error('\nAvailable commands:');
  console.error(chalk.gray('  init [directory]    ') + 'Initialize a new mcp-devkit project');
  console.error(chalk.gray('  serve               ') + 'Start MCP server for Claude Desktop');
  console.error(chalk.gray('  status              ') + 'Check project status');
  console.error(chalk.gray('  validate [path]     ') + 'Validate project files');
  console.error(chalk.gray('  enhance <file>      ') + 'Enhance documents with AI agents');
  console.error('\nRun ' + chalk.cyan('mcp-devkit --help') + ' for more information.\n');
  process.exit(1);
});

// Parse arguments and execute
program.parse();