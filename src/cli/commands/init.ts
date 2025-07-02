import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import { createInterface } from 'readline';
import { TemplateManager } from '../../core/templates/manager.js';
import { Logger } from '../../utils/logger.js';
import { AIProjectOrchestrator } from '../../core/ai-planning/orchestrator.js';
import { ProjectInput } from '../../core/ai-planning/types.js';

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
    // Gather project information
    console.log(chalk.bold('📋 Let\'s understand your project'));
    console.log(chalk.gray('I\'ll ask you a few questions to help AI create the perfect plan.\n'));

    const projectName = await question(chalk.cyan('What is your project name? '));
    const description = await question(chalk.cyan('Describe your project in one sentence: '));
    
    console.log(chalk.gray('\nWhat are your main goals? (press Enter after each, empty line to finish)'));
    const goals: string[] = [];
    let goal: string;
    do {
      goal = await question(chalk.cyan(`Goal ${goals.length + 1}: `));
      if (goal.trim()) goals.push(goal.trim());
    } while (goal.trim() && goals.length < 5);

    console.log(chalk.gray('\nAny constraints or requirements? (press Enter after each, empty line to finish)'));
    const constraints: string[] = [];
    let constraint: string;
    do {
      constraint = await question(chalk.cyan(`Constraint ${constraints.length + 1}: `));
      if (constraint.trim()) constraints.push(constraint.trim());
    } while (constraint.trim() && constraints.length < 5);

    const projectType = await question(chalk.cyan('\nProject type (web-app/api/cli/mobile/saas): ')) || 'web-app';
    const experienceLevel = await question(chalk.cyan('Your experience level (beginner/intermediate/advanced): ')) || 'intermediate';
    const timeline = await question(chalk.cyan('Desired timeline (e.g., 2 weeks, 3 months): ')) || '3 months';
    
    // Check for API keys
    const hasOpenAI = !!process.env['OPENAI_API_KEY'];
    const hasAnthropic = !!process.env['ANTHROPIC_API_KEY'];
    const hasGoogle = !!process.env['GOOGLE_AI_API_KEY'];
    
    if (!hasOpenAI && !hasAnthropic && !hasGoogle) {
      console.log(chalk.yellow('\n⚠️  No AI API keys detected'));
      console.log(chalk.gray('Set environment variables for better results:'));
      console.log(chalk.gray('  • OPENAI_API_KEY - For GPT-4 architecture design'));
      console.log(chalk.gray('  • ANTHROPIC_API_KEY - For Claude requirements analysis'));
      console.log(chalk.gray('  • GOOGLE_AI_API_KEY - For Gemini project planning'));
      console.log(chalk.gray('\nUsing intelligent fallback planning...\n'));
    } else {
      console.log(chalk.green('\n✓ AI providers configured:'));
      if (hasOpenAI) console.log(chalk.gray('  • OpenAI GPT-4'));
      if (hasAnthropic) console.log(chalk.gray('  • Anthropic Claude'));
      if (hasGoogle) console.log(chalk.gray('  • Google Gemini'));
    }

    rl.close();

    // Create project input
    const projectInput: ProjectInput = {
      name: projectName,
      description,
      goals,
      constraints: constraints.length > 0 ? constraints : ['Budget-conscious', 'Time-efficient', 'Maintainable'],
      preferences: {
        projectType,
        experienceLevel,
        timeline
      }
    };

    // Use AI orchestrator to analyze and plan
    const orchestrator = new AIProjectOrchestrator();
    const analysis = await orchestrator.analyzeProject(projectInput);

    // Update all documents with AI-generated content
    await updateProjectDocuments(mcpPath, projectInput, analysis);

    // Display summary
    console.log(chalk.bold.green('\n🎉 AI-Powered Project Setup Complete!'));
    console.log(chalk.gray('Your project has been analyzed by multiple AI models:\n'));
    
    console.log(chalk.bold('📋 Requirements (Claude):'));
    console.log(chalk.gray(`  • Problem: ${analysis.requirements.problemStatement.substring(0, 80)}...`));
    console.log(chalk.gray(`  • Audience: ${analysis.requirements.targetAudience}`));
    console.log(chalk.gray(`  • ${analysis.requirements.keyFeatures.length} key features defined`));
    
    console.log(chalk.bold('\n🏗️ Architecture (GPT-4):'));
    const techItems = Object.entries(analysis.architecture.techStack)
      .filter(([_, techs]) => techs && techs.length > 0)
      .map(([key, techs]) => `${key}: ${techs!.join(', ')}`);
    techItems.forEach(item => console.log(chalk.gray(`  • ${item}`)));
    
    console.log(chalk.bold('\n📅 Project Plan (Gemini):'));
    console.log(chalk.gray(`  • ${analysis.plan.phases.length} development phases`));
    console.log(chalk.gray(`  • ${analysis.plan.phases.reduce((sum, p) => sum + p.tasks.length, 0)} total tasks`));
    console.log(chalk.gray(`  • ${analysis.plan.milestones.length} milestones identified`));
    
    console.log(chalk.dim('\n💡 Next: Review the generated documents in .mcp/ and start developing!'));

  } catch (error) {
    rl.close();
    throw error;
  }
}

async function updateProjectDocuments(
  mcpPath: string, 
  input: ProjectInput,
  analysis: Awaited<ReturnType<AIProjectOrchestrator['analyzeProject']>>
): Promise<void> {
  // Update PRD
  await updatePRDWithAI(mcpPath, input, analysis.requirements);
  
  // Update Architecture
  await updateArchitectureWithAI(mcpPath, analysis.architecture);
  
  // Update Task List
  await updateTaskListWithAI(mcpPath, input, analysis.plan);
  
  // Create metadata with AI analysis results
  await createProjectMetadata(mcpPath, input, analysis);
}

async function updatePRDWithAI(
  mcpPath: string, 
  input: ProjectInput,
  requirements: Awaited<ReturnType<AIProjectOrchestrator['analyzeProject']>>['requirements']
): Promise<void> {
  const prdPath = path.join(mcpPath, 'context_prd.md');
  
  try {
    let prdContent = await fs.readFile(prdPath, 'utf-8');
    
    // Replace placeholders with AI-generated content
    prdContent = prdContent.replace(
      /# Project Requirements Document.*?\n\n/s,
      `# ${input.name} - Project Requirements Document\n\n`
    );
    
    prdContent = prdContent.replace(
      'Describe the problem your project solves and why it matters.',
      requirements.problemStatement
    );
    
    prdContent = prdContent.replace(
      'Define who will use your project and what they need.',
      requirements.targetAudience
    );
    
    // Add comprehensive sections
    const featuresSection = `## Key Features\n\n${requirements.keyFeatures.map(f => `- ${f}`).join('\n')}\n\n`;
    const metricsSection = `## Success Metrics\n\n${requirements.successMetrics.map(m => `- ${m}`).join('\n')}\n\n`;
    const scopeSection = `## Out of Scope\n\n${requirements.outOfScope.map(s => `- ${s}`).join('\n')}\n\n`;
    
    prdContent = prdContent.replace(
      '## Solution Approach',
      featuresSection + metricsSection + scopeSection + '## Solution Approach'
    );
    
    await fs.writeFile(prdPath, prdContent);
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not update PRD file:', error));
  }
}

async function updateArchitectureWithAI(
  mcpPath: string,
  architecture: Awaited<ReturnType<AIProjectOrchestrator['analyzeProject']>>['architecture']
): Promise<void> {
  const archPath = path.join(mcpPath, 'context_architecture.md');
  
  try {
    let archContent = await fs.readFile(archPath, 'utf-8');
    
    // Replace system overview
    archContent = archContent.replace(
      'Describe your overall system architecture and how components interact.',
      architecture.overview
    );
    
    // Build technology stack section
    const techStackContent = Object.entries(architecture.techStack)
      .filter(([_, techs]) => techs && techs.length > 0)
      .map(([category, techs]) => `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n${techs!.map(t => `- ${t}`).join('\n')}`)
      .join('\n\n');
    
    archContent = archContent.replace(
      /## Technology Stack[\s\S]*?(?=## |$)/,
      `## Technology Stack\n\n${techStackContent}\n\n`
    );
    
    // Add components section
    const componentsSection = `## System Components\n\n${architecture.components.map(c => 
      `### ${c.name}\n**Purpose:** ${c.purpose}\n**Technologies:** ${c.technologies.join(', ')}\n`
    ).join('\n')}\n`;
    
    // Add data flow and security sections
    const dataFlowSection = `## Data Flow\n\n${architecture.dataFlow}\n\n`;
    const securitySection = `## Security Considerations\n\n${architecture.securityConsiderations.map(s => `- ${s}`).join('\n')}\n\n`;
    
    archContent = archContent.replace(
      '## Implementation Notes',
      componentsSection + dataFlowSection + securitySection + '## Implementation Notes'
    );
    
    await fs.writeFile(archPath, archContent);
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not update Architecture file:', error));
  }
}

async function updateTaskListWithAI(
  mcpPath: string,
  input: ProjectInput,
  plan: Awaited<ReturnType<AIProjectOrchestrator['analyzeProject']>>['plan']
): Promise<void> {
  const taskPath = path.join(mcpPath, 'context_tasklist.md');
  
  try {
    let taskContent = await fs.readFile(taskPath, 'utf-8');
    
    // Replace title with project-specific title
    taskContent = taskContent.replace(
      '# Task List and Development Plan',
      `# ${input.name} - Development Plan`
    );
    
    // Generate comprehensive phases section
    const phasesContent = plan.phases.map((phase, index) => {
      const tasksContent = phase.tasks.map(task => 
        `- **${task.title}** (${task.priority} priority, ~${task.estimatedHours}h)\n  ${task.description}${task.dependencies ? `\n  Dependencies: ${task.dependencies.join(', ')}` : ''}`
      ).join('\n');
      
      return `## Phase ${index + 1}: ${phase.name}\n**Duration:** ${phase.duration}\n**Goals:** ${phase.goals.join(', ')}\n\n### Tasks:\n${tasksContent}`;
    }).join('\n\n');
    
    taskContent = taskContent.replace(
      /## Development Phases[\s\S]*?(?=## |$)/,
      `## Development Phases\n\n${phasesContent}\n\n`
    );
    
    // Add milestones section
    const milestonesContent = `## Milestones\n\n${plan.milestones.map(m => 
      `- **${m.name}**\n  Deliverables: ${m.deliverables.join(', ')}`
    ).join('\n')}\n\n`;
    
    // Add risks section
    const risksContent = `## Risk Assessment\n\n${plan.risks.map(r => 
      `- **${r.description}** (${r.impact} impact)\n  Mitigation: ${r.mitigation}`
    ).join('\n')}\n\n`;
    
    // Insert new sections before tracking
    taskContent = taskContent.replace(
      '## Progress Tracking',
      milestonesContent + risksContent + '## Progress Tracking'
    );
    
    await fs.writeFile(taskPath, taskContent);
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not update Task List file:', error));
  }
}

async function createProjectMetadata(
  mcpPath: string,
  input: ProjectInput,
  analysis: Awaited<ReturnType<AIProjectOrchestrator['analyzeProject']>>
): Promise<void> {
  const metadataPath = path.join(mcpPath, 'metadata.json');
  
  const metadata = {
    project: {
      name: input.name,
      description: input.description,
      type: input.preferences.projectType,
      created: new Date().toISOString()
    },
    analysis: {
      timestamp: analysis.metadata.analyzedAt,
      providers: analysis.metadata.providers,
      summary: {
        featuresCount: analysis.requirements.keyFeatures.length,
        phasesCount: analysis.plan.phases.length,
        totalTasks: analysis.plan.phases.reduce((sum, p) => sum + p.tasks.length, 0),
        estimatedHours: analysis.plan.phases.reduce((sum, p) => 
          sum + p.tasks.reduce((taskSum, t) => taskSum + t.estimatedHours, 0), 0
        )
      }
    },
    preferences: input.preferences,
    phase: 'planning',
    status: 'active'
  };
  
  try {
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not create metadata file:', error));
  }
}