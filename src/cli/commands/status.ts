import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';

export const createStatusCommand = (): Command => {
  return new Command('status')
    .description('Check project status and development progress')
    .argument('[directory]', 'Project directory to check', '.')
    .option('--json', 'Output status in JSON format')
    .option('--verbose', 'Show detailed status information')
    .action(async (directory: string, options: { json?: boolean; verbose?: boolean }) => {
      const spinner = ora('Analyzing project status...').start();
      
      try {
        const status = await checkProjectStatus(directory, options);
        spinner.stop();
        
        if (options.json) {
          console.log(JSON.stringify(status, null, 2));
        } else {
          displayStatus(status, options.verbose);
        }
      } catch (error) {
        spinner.fail('Failed to check project status');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};

interface ProjectStatus {
  hasProject: boolean;
  projectPath: string;
  phase: string;
  progress: string;
  lastUpdated?: string | undefined;
  currentTask?: string;
  nextSteps: string[];
  files: {
    prd: boolean;
    architecture: boolean;
    tasklist: boolean;
    metadata: boolean;
  };
}

async function checkProjectStatus(directory: string, _options: { verbose?: boolean }): Promise<ProjectStatus> {
  const projectPath = path.resolve(directory);
  const mcpPath = path.join(projectPath, '.mcp');
  
  // Check if .mcp directory exists
  try {
    await fs.access(mcpPath);
  } catch {
    return {
      hasProject: false,
      projectPath,
      phase: 'none',
      progress: '0%',
      nextSteps: ['Run `mcp-devkit init` to initialize project'],
      files: {
        prd: false,
        architecture: false,
        tasklist: false,
        metadata: false
      }
    };
  }

  // Check for key files
  const files = {
    prd: await fileExists(path.join(mcpPath, 'context_prd.md')),
    architecture: await fileExists(path.join(mcpPath, 'context_architecture.md')),
    tasklist: await fileExists(path.join(mcpPath, 'context_tasklist.md')),
    metadata: await fileExists(path.join(mcpPath, 'metadata.json'))
  };

  // Read metadata if available
  let metadata: any = {};
  let lastUpdated: string | undefined;
  if (files.metadata) {
    try {
      const metadataContent = await fs.readFile(path.join(mcpPath, 'metadata.json'), 'utf-8');
      metadata = JSON.parse(metadataContent);
      lastUpdated = metadata.lastUpdated || metadata.created;
    } catch {
      // Ignore metadata read errors
    }
  }

  // Analyze progress
  const completedFiles = Object.values(files).filter(Boolean).length;
  const totalFiles = Object.keys(files).length;
  const progress = `${Math.round((completedFiles / totalFiles) * 100)}%`;

  // Determine phase and next steps
  const { phase, currentTask, nextSteps } = determinePhaseAndNextSteps(files, metadata);

  return {
    hasProject: true,
    projectPath,
    phase,
    progress,
    lastUpdated,
    currentTask,
    nextSteps,
    files
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function determinePhaseAndNextSteps(files: ProjectStatus['files'], metadata: any) {
  if (!files.prd) {
    return {
      phase: 'initialization',
      currentTask: 'Complete project requirements',
      nextSteps: [
        'Edit .mcp/context_prd.md to define project requirements',
        'Specify the problem your project solves',
        'Define target audience and key features'
      ]
    };
  }

  if (!files.architecture) {
    return {
      phase: 'planning',
      currentTask: 'Design system architecture',
      nextSteps: [
        'Edit .mcp/context_architecture.md to define system design',
        'Choose technology stack',
        'Plan component structure and data flow'
      ]
    };
  }

  if (!files.tasklist) {
    return {
      phase: 'planning',
      currentTask: 'Break down development tasks',
      nextSteps: [
        'Edit .mcp/context_tasklist.md to create task breakdown',
        'Prioritize features by importance',
        'Estimate time for each development phase'
      ]
    };
  }

  // All basic files exist - check metadata for current phase
  const currentPhase = metadata.phase || 'implementation';
  
  return {
    phase: currentPhase,
    currentTask: metadata.currentTask || 'Begin implementation',
    nextSteps: [
      'Start implementing core features',
      'Follow the development plan in .mcp/context_tasklist.md',
      'Use `mcp-devkit demo` to see implementation guidance'
    ]
  };
}

function displayStatus(status: ProjectStatus, verbose?: boolean) {
  console.log(chalk.cyan('\n📊 Project Status Report\n'));

  if (!status.hasProject) {
    console.log(chalk.yellow('⚠️  No mcp-devkit project found'));
    console.log(chalk.gray(`   Checked: ${status.projectPath}`));
    console.log('\n' + chalk.bold('Next Steps:'));
    status.nextSteps.forEach((step, i) => {
      console.log(chalk.gray(`  ${i + 1}.`), step);
    });
    return;
  }

  // Project overview
  console.log(chalk.bold('Project:'), chalk.green(path.basename(status.projectPath)));
  console.log(chalk.bold('Phase:'), getPhaseDisplay(status.phase));
  console.log(chalk.bold('Progress:'), getProgressDisplay(status.progress));
  
  if (status.lastUpdated) {
    console.log(chalk.bold('Last Updated:'), chalk.gray(new Date(status.lastUpdated).toLocaleString()));
  }

  // Current status
  console.log('\n' + chalk.bold('📋 Current Status:'));
  if (status.currentTask) {
    console.log(chalk.gray('  Task:'), status.currentTask);
  }

  // Files status
  console.log('\n' + chalk.bold('📁 Project Files:'));
  const fileStatus = [
    { name: 'Requirements (PRD)', key: 'prd', path: '.mcp/context_prd.md' },
    { name: 'Architecture', key: 'architecture', path: '.mcp/context_architecture.md' },
    { name: 'Task List', key: 'tasklist', path: '.mcp/context_tasklist.md' },
    { name: 'Metadata', key: 'metadata', path: '.mcp/metadata.json' }
  ];

  fileStatus.forEach(file => {
    const exists = status.files[file.key as keyof typeof status.files];
    const icon = exists ? chalk.green('✓') : chalk.red('✗');
    const statusText = exists ? chalk.green('Complete') : chalk.yellow('Pending');
    console.log(`  ${icon} ${file.name}: ${statusText}`);
    if (verbose) {
      console.log(chalk.gray(`     ${file.path}`));
    }
  });

  // Next steps
  console.log('\n' + chalk.bold('🎯 Next Steps:'));
  status.nextSteps.forEach((step, i) => {
    console.log(chalk.gray(`  ${i + 1}.`), step);
  });

  // Tips
  console.log('\n' + chalk.dim('💡 Tips:'));
  console.log(chalk.dim('  • Use `mcp-devkit demo` for interactive guidance'));
  console.log(chalk.dim('  • Configure Claude Desktop to use mcp-devkit as MCP server'));
  console.log(chalk.dim('  • Edit files in .mcp/ directory to update project state'));
}

function getPhaseDisplay(phase: string): string {
  const phases: Record<string, string> = {
    'none': chalk.gray('Not initialized'),
    'initialization': chalk.yellow('🏗️  Initialization'),
    'planning': chalk.blue('📋 Planning'),
    'implementation': chalk.green('⚡ Implementation'),
    'testing': chalk.cyan('🧪 Testing'),
    'deployment': chalk.magenta('🚀 Deployment'),
    'complete': chalk.green('✅ Complete')
  };
  
  return phases[phase] || chalk.gray(phase);
}

function getProgressDisplay(progress: string): string {
  const percentage = parseInt(progress);
  
  if (percentage === 0) return chalk.gray(progress);
  if (percentage < 25) return chalk.red(progress);
  if (percentage < 50) return chalk.yellow(progress);
  if (percentage < 75) return chalk.blue(progress);
  if (percentage < 100) return chalk.cyan(progress);
  return chalk.green(progress);
}