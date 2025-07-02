import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import { TemplateManager } from '../../core/templates/manager.js';
import { Logger } from '../../utils/logger.js';

export const initCommand = new Command('init')
  .description('Initialize a new mcp-devkit project')
  .argument('[directory]', 'Target directory for the project', '.')
  .option('--force', 'Overwrite existing .mcp directory if it exists')
  .option('--template <type>', 'Project template type', 'default')
  .action(async (directory: string, options: { force?: boolean; template?: string }) => {
    const logger = new Logger(false);
    
    try {
      await initializeProject(directory, options, logger);
    } catch (error) {
      logger.error('Failed to initialize project:', error);
      process.exit(1);
    }
  });

async function initializeProject(
  directory: string, 
  options: { force?: boolean; template?: string },
  logger: Logger
): Promise<void> {
  const targetPath = path.resolve(directory);
  const mcpPath = path.join(targetPath, '.mcp');
  
  // ASCII art banner
  console.log(chalk.cyan(`
  ███╗   ███╗ ██████╗██████╗       ██████╗ ███████╗██╗   ██╗██╗  ██╗██╗████████╗
  ████╗ ████║██╔════╝██╔══██╗      ██╔══██╗██╔════╝██║   ██║██║ ██╔╝██║╚══██╔══╝
  ██╔████╔██║██║     ██████╔╝█████╗██║  ██║█████╗  ██║   ██║█████╔╝ ██║   ██║   
  ██║╚██╔╝██║██║     ██╔═══╝ ╚════╝██║  ██║██╔══╝  ╚██╗ ██╔╝██╔═██╗ ██║   ██║   
  ██║ ╚═╝ ██║╚██████╗██║           ██████╔╝███████╗ ╚████╔╝ ██║  ██╗██║   ██║   
  ╚═╝     ╚═╝ ╚═════╝╚═╝           ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝   ╚═╝   
  
  Claude's Persistent Development Partner
  `));

  // Check if directory exists and is accessible
  const spinner = ora('Checking target directory...').start();
  
  try {
    await fs.access(targetPath);
  } catch {
    try {
      await fs.mkdir(targetPath, { recursive: true });
      spinner.succeed('Created target directory');
    } catch (error) {
      spinner.fail('Failed to create target directory');
      throw error;
    }
  }
  
  spinner.succeed('Target directory verified');

  // Check for existing .mcp directory
  const mcpSpinner = ora('Checking for existing .mcp directory...').start();
  
  try {
    await fs.access(mcpPath);
    
    if (!options.force) {
      mcpSpinner.fail('.mcp directory already exists');
      console.log(chalk.yellow('Use --force to overwrite existing .mcp directory'));
      return;
    }
    
    await fs.rm(mcpPath, { recursive: true });
    mcpSpinner.warn('Removed existing .mcp directory');
  } catch {
    mcpSpinner.succeed('No existing .mcp directory found');
  }

  // Initialize templates
  const templateSpinner = ora('Initializing project templates...').start();
  
  try {
    const templateManager = new TemplateManager(logger);
    await templateManager.initializeProject(mcpPath, options.template || 'default');
    templateSpinner.succeed('Project templates initialized');
  } catch (error) {
    templateSpinner.fail('Failed to initialize templates');
    throw error;
  }

  // Success message with animated checkmark
  const successSpinner = ora({
    text: chalk.green('Project initialized successfully!'),
    spinner: 'dots',
    color: 'green'
  }).start();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  successSpinner.succeed();
  
  // Display project info box
  console.log('\n' + chalk.cyan('┌─────────────────────────────────────────────────────────┐'));
  console.log(chalk.cyan('│') + chalk.bold.white('  📁 Project Structure Created                           ') + chalk.cyan('│'));
  console.log(chalk.cyan('├─────────────────────────────────────────────────────────┤'));
  console.log(chalk.cyan('│') + '  ' + chalk.yellow('.mcp/') + '                                               ' + chalk.cyan('│'));
  console.log(chalk.cyan('│') + '  ├── ' + chalk.green('context_prd.md') + '       Product requirements      ' + chalk.cyan('│'));
  console.log(chalk.cyan('│') + '  ├── ' + chalk.green('context_architecture.md') + '  System design       ' + chalk.cyan('│'));
  console.log(chalk.cyan('│') + '  ├── ' + chalk.green('context_tasklist.md') + '  Development tasks       ' + chalk.cyan('│'));
  console.log(chalk.cyan('│') + '  ├── ' + chalk.blue('metadata.json') + '        Project metadata        ' + chalk.cyan('│'));
  console.log(chalk.cyan('│') + '  └── ' + chalk.gray('archive/') + '             Historical artifacts    ' + chalk.cyan('│'));
  console.log(chalk.cyan('└─────────────────────────────────────────────────────────┘\n'));
  
  // Next steps with icons
  console.log(chalk.bold('🚀 Next Steps:'));
  console.log();
  console.log(chalk.gray('  1.'), chalk.bold('Review Templates'));
  console.log(chalk.gray('     └─'), 'Explore the generated files in', chalk.cyan('.mcp/'));
  console.log();
  console.log(chalk.gray('  2.'), chalk.bold('Define Your Project'));
  console.log(chalk.gray('     └─'), 'Edit', chalk.cyan('.mcp/context_prd.md'), 'with your requirements');
  console.log();
  console.log(chalk.gray('  3.'), chalk.bold('Start Development'));
  console.log(chalk.gray('     └─'), 'Use Claude with mcp-devkit for persistent memory');
  console.log();
  
  // Pro tip
  console.log(chalk.dim('💡 Pro tip: Configure Claude Desktop to use mcp-devkit:'));
  console.log(chalk.dim('   Add to claude_desktop_config.json:'));
  console.log(chalk.dim('   "mcp-devkit": { "command": "mcp-devkit", "args": ["serve"] }'));
  
  console.log(chalk.dim('\n📚 Documentation: https://github.com/escott/mcp-devkit'));
}