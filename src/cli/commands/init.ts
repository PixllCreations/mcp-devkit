import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import { createInterface } from 'readline';
import { TemplateManager } from '../../core/templates/manager.js';
import { Logger } from '../../utils/logger.js';

export const initCommand = new Command('init')
  .description('Initialize a new mcp-devkit project')
  .argument('[directory]', 'Target directory for the project', '.')
  .option('--force', 'Overwrite existing .mcp directory if it exists')
  .option('--template <type>', 'Project template type', 'default')
  .option('--interactive', 'Interactive mode to guide document creation')
  .action(async (directory: string, options: { force?: boolean; template?: string; interactive?: boolean }) => {
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
  options: { force?: boolean; template?: string; interactive?: boolean },
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

  // Interactive mode for filling out documents
  if (options.interactive) {
    console.log(chalk.cyan('\n🤖 Interactive Project Setup'));
    console.log(chalk.gray('Let\'s fill out your project documents together!\n'));
    
    await interactiveDocumentSetup(mcpPath);
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

async function interactiveDocumentSetup(mcpPath: string): Promise<void> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  };

  try {
    // 1. Project Requirements Document (PRD)
    console.log(chalk.bold('📋 Project Requirements Document (PRD)'));
    console.log(chalk.gray('Define what your project does and why it matters.\n'));

    const projectName = await question(chalk.cyan('What is your project name? '));
    const problemStatement = await question(chalk.cyan('What problem does your project solve? '));
    const targetAudience = await question(chalk.cyan('Who is your target audience? '));
    const keyFeatures = await question(chalk.cyan('What are the key features? (comma-separated) '));
    const projectType = await question(chalk.cyan('What type of project is this? (web-app/api/cli/mobile/other) ')) || 'web-app';

    // Update PRD file
    await updatePRD(mcpPath, {
      projectName,
      problemStatement,
      targetAudience,
      keyFeatures: keyFeatures.split(',').map(f => f.trim()).filter(f => f),
      projectType
    });

    console.log(chalk.green('✓ Requirements document updated!\n'));

    // 2. Architecture Document
    console.log(chalk.bold('🏗️ System Architecture'));
    console.log(chalk.gray('Define your technical approach and system design.\n'));

    const techStack = await question(chalk.cyan('What technologies will you use? (e.g., React, Node.js, PostgreSQL) '));
    const architecture = await question(chalk.cyan('Describe your system architecture: '));
    const databaseChoice = await question(chalk.cyan('What database will you use? (if any) ')) || 'None';
    const deployment = await question(chalk.cyan('Where will you deploy this? (e.g., Vercel, AWS, local) '));

    // Update Architecture file
    await updateArchitecture(mcpPath, {
      techStack,
      architecture,
      databaseChoice,
      deployment
    });

    console.log(chalk.green('✓ Architecture document updated!\n'));

    // 3. Task List
    console.log(chalk.bold('📝 Development Tasks'));
    console.log(chalk.gray('Break down your project into manageable tasks.\n'));

    const phases: string[] = [];
    let addMorePhases = true;
    let phaseNumber = 1;

    while (addMorePhases && phaseNumber <= 5) {
      const phaseName = await question(chalk.cyan(`Phase ${phaseNumber} name (or press Enter to finish): `));
      if (!phaseName.trim()) {
        addMorePhases = false;
        break;
      }

      const phaseTasks = await question(chalk.cyan(`Tasks for ${phaseName} (comma-separated): `));
      phases.push(`**${phaseName}**\n${phaseTasks.split(',').map(t => `- ${t.trim()}`).join('\n')}`);
      
      phaseNumber++;
    }

    // Update Task List file
    await updateTaskList(mcpPath, { phases, projectType });

    console.log(chalk.green('✓ Task list document updated!\n'));

    // Final summary
    console.log(chalk.bold.green('🎉 Interactive setup complete!'));
    console.log(chalk.gray('Your project documents have been customized with your responses.'));
    console.log(chalk.gray('You can always edit the files in .mcp/ directory manually.\n'));

  } finally {
    rl.close();
  }
}

async function updatePRD(mcpPath: string, data: {
  projectName: string;
  problemStatement: string;
  targetAudience: string;
  keyFeatures: string[];
  projectType: string;
}): Promise<void> {
  const prdPath = path.join(mcpPath, 'context_prd.md');
  
  try {
    let prdContent = await fs.readFile(prdPath, 'utf-8');
    
    // Replace placeholders with actual content
    prdContent = prdContent.replace(
      /# Project Requirements Document.*?\n\n/s,
      `# ${data.projectName} - Project Requirements Document\n\n`
    );
    
    prdContent = prdContent.replace(
      'Describe the problem your project solves and why it matters.',
      data.problemStatement
    );
    
    prdContent = prdContent.replace(
      'Define who will use your project and what they need.',
      data.targetAudience
    );
    
    // Add key features section
    const featuresSection = `## Key Features\n\n${data.keyFeatures.map(f => `- ${f}`).join('\n')}\n\n## Project Type\n\n${data.projectType}\n\n`;
    prdContent = prdContent.replace(
      '## Solution Approach',
      featuresSection + '## Solution Approach'
    );
    
    await fs.writeFile(prdPath, prdContent);
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not update PRD file:', error));
  }
}

async function updateArchitecture(mcpPath: string, data: {
  techStack: string;
  architecture: string;
  databaseChoice: string;
  deployment: string;
}): Promise<void> {
  const archPath = path.join(mcpPath, 'context_architecture.md');
  
  try {
    let archContent = await fs.readFile(archPath, 'utf-8');
    
    // Replace technology stack section
    archContent = archContent.replace(
      /## Technology Stack[\s\S]*?(?=## |$)/,
      `## Technology Stack\n\n${data.techStack}\n\n`
    );
    
    // Replace system overview
    archContent = archContent.replace(
      'Describe your overall system architecture and how components interact.',
      data.architecture
    );
    
    // Add database and deployment sections
    const infrastructureSection = `## Database\n\n${data.databaseChoice}\n\n## Deployment\n\n${data.deployment}\n\n`;
    
    if (!archContent.includes('## Database')) {
      archContent = archContent.replace(
        '## Implementation Notes',
        infrastructureSection + '## Implementation Notes'
      );
    }
    
    await fs.writeFile(archPath, archContent);
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not update Architecture file:', error));
  }
}

async function updateTaskList(mcpPath: string, data: {
  phases: string[];
  projectType: string;
}): Promise<void> {
  const taskPath = path.join(mcpPath, 'context_tasklist.md');
  
  try {
    let taskContent = await fs.readFile(taskPath, 'utf-8');
    
    // Replace the development phases section
    const phasesContent = `## Development Phases\n\n${data.phases.join('\n\n')}\n\n`;
    
    taskContent = taskContent.replace(
      /## Development Phases[\s\S]*?(?=## |$)/,
      phasesContent
    );
    
    // Add project type context
    taskContent = taskContent.replace(
      '# Task List and Development Plan',
      `# ${data.projectType.charAt(0).toUpperCase() + data.projectType.slice(1)} Development Plan`
    );
    
    await fs.writeFile(taskPath, taskContent);
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not update Task List file:', error));
  }
}