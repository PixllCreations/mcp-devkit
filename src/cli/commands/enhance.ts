import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';
import { 
  agentRegistry, 
  AgentConfigManager,
  MockAgentProvider,
  ShellAgentProvider, 
  OpenAIAgentProvider,
  BUILT_IN_ROLES,
  AgentType,
  AgentRoleName,
  Enhancement
} from '../../core/agents/index.js';
import { logger } from '../../utils/logger.js';

export function createEnhanceCommand(): Command {
  const command = new Command('enhance');
  
  command
    .description('Enhance documents using AI agents')
    .argument('<file>', 'File to enhance')
    .option('-a, --agent <name>', 'Agent to use for enhancement')
    .option('-r, --role <role>', 'Agent role: architect, reviewer, optimizer, planner', 'reviewer')
    .option('-o, --output <file>', 'Output file (defaults to overwriting input)')
    .option('-f, --format <format>', 'Output format: enhanced, diff, json', 'enhanced')
    .option('--dry-run', 'Show what would be enhanced without making changes', false)
    .option('--cost-estimate', 'Show cost estimate before enhancement', false)
    .option('--config <path>', 'Agent configuration file', '.mcp/agents.json')
    .action(async (file: string, options) => {
      try {
        await runEnhancement(file, options);
      } catch (error) {
        logger.error('Enhancement failed:', error);
        process.exit(1);
      }
    });

  return command;
}

interface EnhanceOptions {
  agent?: string;
  role: string;
  output?: string;
  format: 'enhanced' | 'diff' | 'json';
  dryRun: boolean;
  costEstimate: boolean;
  config: string;
}

async function runEnhancement(filePath: string, options: EnhanceOptions) {
  const cwd = process.cwd();
  const fullPath = resolve(cwd, filePath);

  // Check if file exists
  if (!existsSync(fullPath)) {
    logger.error(`File does not exist: ${fullPath}`);
    process.exit(1);
  }

  // Validate role
  const roleName = options.role as AgentRoleName;
  if (!Object.values(AgentRoleName).includes(roleName)) {
    logger.error(`Invalid role: ${options.role}. Valid roles: ${Object.values(AgentRoleName).join(', ')}`);
    process.exit(1);
  }

  const role = BUILT_IN_ROLES[roleName];

  // Initialize agent registry with providers
  await initializeAgentProviders();

  // Load agent configuration
  const configManager = new AgentConfigManager(options.config);
  const agentConfigs = await configManager.loadConfig();

  // Determine which agent to use
  const agentName = options.agent || agentConfigs.defaultAgent || 'mock';
  const agentConfig = agentConfigs.agents[agentName];

  if (!agentConfig) {
    logger.error(`Agent '${agentName}' not found in configuration`);
    logger.info(`Available agents: ${Object.keys(agentConfigs.agents).join(', ')}`);
    process.exit(1);
  }

  // Resolve environment variables in config
  const resolvedConfig = configManager.resolveEnvironmentVariables(agentConfig);

  // Create agent
  let agent;
  try {
    agent = await agentRegistry.createAgent(resolvedConfig);
    logger.info(`Using agent: ${chalk.cyan(agent.name)} (${agent.type})`);
  } catch (error) {
    logger.error(`Failed to create agent '${agentName}':`, error);
    process.exit(1);
  }

  // Read input file
  const content = readFileSync(fullPath, 'utf-8');
  logger.info(`Read ${content.length} characters from ${chalk.yellow(filePath)}`);

  // Show cost estimate if requested
  if (options.costEstimate) {
    try {
      const estimatedCost = await agent.estimateCost(content, role);
      if (estimatedCost > 0) {
        logger.info(`Estimated cost: ${chalk.green(`$${estimatedCost.toFixed(6)}`)}`);
        
        if (!options.dryRun) {
          // Ask for confirmation if cost is significant
          if (estimatedCost > 0.01) {
            const confirmation = await promptForConfirmation(
              `This enhancement may cost $${estimatedCost.toFixed(4)}. Continue?`
            );
            if (!confirmation) {
              logger.info('Enhancement cancelled');
              return;
            }
          }
        }
      }
    } catch (error) {
      logger.warn('Could not estimate cost:', error);
    }
  }

  if (options.dryRun) {
    logger.info(`Would enhance ${chalk.yellow(filePath)} using ${chalk.cyan(agentName)} as ${chalk.blue(roleName)}`);
    return;
  }

  // Perform enhancement
  logger.info(`Enhancing with role: ${chalk.blue(roleName)}`);
  const startTime = Date.now();
  
  let enhancement: Enhancement;
  try {
    enhancement = await agent.enhance(content, role);
  } catch (error) {
    logger.error('Enhancement failed:', error);
    process.exit(1);
  }

  const duration = Date.now() - startTime;
  logger.info(`Enhancement completed in ${duration}ms`);

  // Show metadata
  if (enhancement.metadata.tokenUsage) {
    const usage = enhancement.metadata.tokenUsage;
    logger.info(`Token usage: ${usage.prompt} + ${usage.completion} = ${usage.total} tokens`);
  }
  
  if (enhancement.metadata.cost && enhancement.metadata.cost > 0) {
    logger.info(`Actual cost: ${chalk.green(`$${enhancement.metadata.cost.toFixed(6)}`)}`);
  }

  // Output results
  switch (options.format) {
    case 'json':
      outputJson(enhancement);
      break;
    case 'diff':
      outputDiff(enhancement, filePath);
      break;
    default:
      outputEnhanced(enhancement, filePath, options.output);
      break;
  }

  // Show summary
  if (enhancement.changes.length > 0) {
    console.log(chalk.bold('\nChanges made:'));
    for (const change of enhancement.changes) {
      const icon = getChangeIcon(change.type);
      console.log(`  ${icon} ${change.description} (${Math.round(change.confidence * 100)}% confidence)`);
      if (change.rationale) {
        console.log(`    ${chalk.dim(change.rationale)}`);
      }
    }
  }
}

async function initializeAgentProviders() {
  agentRegistry.registerProvider(AgentType.MOCK, new MockAgentProvider());
  agentRegistry.registerProvider(AgentType.SHELL, new ShellAgentProvider());
  agentRegistry.registerProvider(AgentType.OPENAI, new OpenAIAgentProvider());
}

function outputJson(enhancement: Enhancement) {
  console.log(JSON.stringify(enhancement, null, 2));
}

function outputDiff(enhancement: Enhancement, filePath: string) {
  console.log(chalk.bold(`--- ${filePath} (original)`));
  console.log(chalk.bold(`+++ ${filePath} (enhanced)`));
  console.log();
  
  const originalLines = enhancement.originalContent.split('\n');
  const enhancedLines = enhancement.enhancedContent.split('\n');
  
  // Simple diff display (could be enhanced with proper diff algorithm)
  const maxLines = Math.max(originalLines.length, enhancedLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const original = originalLines[i] || '';
    const enhanced = enhancedLines[i] || '';
    
    if (original !== enhanced) {
      if (original) {
        console.log(chalk.red(`- ${original}`));
      }
      if (enhanced) {
        console.log(chalk.green(`+ ${enhanced}`));
      }
    } else if (original) {
      console.log(chalk.gray(`  ${original}`));
    }
  }
}

function outputEnhanced(enhancement: Enhancement, filePath: string, outputPath?: string) {
  const targetPath = outputPath || filePath;
  
  try {
    writeFileSync(targetPath, enhancement.enhancedContent, 'utf-8');
    logger.info(`Enhanced content written to ${chalk.green(targetPath)}`);
  } catch (error) {
    logger.error(`Failed to write enhanced content:`, error);
    process.exit(1);
  }
}

function getChangeIcon(type: string): string {
  switch (type) {
    case 'addition':
      return chalk.green('+');
    case 'modification':
      return chalk.yellow('~');
    case 'deletion':
      return chalk.red('-');
    case 'restructure':
      return chalk.blue('↻');
    default:
      return '•';
  }
}

async function promptForConfirmation(message: string): Promise<boolean> {
  // In a real implementation, you'd use a proper prompt library
  // For now, we'll just return true to avoid blocking
  console.log(chalk.yellow(`⚠ ${message}`));
  return true;
}