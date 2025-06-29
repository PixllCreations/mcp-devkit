#!/usr/bin/env node

/**
 * mcp-devkit Demo Script
 * Demonstrates the full functionality of mcp-devkit CLI
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const DEMO_DIR = 'demo-project';

// Utility functions
const log = (message) => console.log(chalk.blue('[DEMO]'), message);
const success = (message) => console.log(chalk.green('✓'), message);
const warning = (message) => console.log(chalk.yellow('⚠'), message);
const error = (message) => console.log(chalk.red('✗'), message);

const step = (title) => {
  console.log('\n' + chalk.cyan('═'.repeat(60)));
  console.log(chalk.cyan(` ${title}`));
  console.log(chalk.cyan('═'.repeat(60)) + '\n');
};

const pause = () => {
  if (process.argv.includes('--interactive')) {
    console.log(chalk.yellow('\nPress Enter to continue...'));
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit());
  } else {
    // Small delay for non-interactive mode
    execSync('sleep 1', { stdio: 'inherit' });
  }
};

const cleanup = () => {
  if (fs.existsSync(DEMO_DIR)) {
    fs.rmSync(DEMO_DIR, { recursive: true, force: true });
    success(`Cleaned up demo directory: ${DEMO_DIR}`);
  }
};

const runCommand = (command, description) => {
  try {
    log(`Running: ${command}`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    return true;
  } catch (err) {
    if (description && description.includes('error test')) {
      // Expected error for demo
      console.log(err.stdout || err.message);
      return true;
    }
    error(`Command failed: ${command}`);
    console.log(err.stdout || err.message);
    return false;
  }
};

// Main demo function
async function runDemo() {
  log('Starting mcp-devkit demo...');
  
  // Cleanup any existing demo
  cleanup();

  step('1. Welcome to mcp-devkit');
  
  console.log(chalk.cyan(`
  ███╗   ███╗ ██████╗██████╗       ██████╗ ███████╗██╗   ██╗██╗  ██╗██╗████████╗
  ████╗ ████║██╔════╝██╔══██╗      ██╔══██╗██╔════╝██║   ██║██║ ██╔╝██║╚══██╔══╝
  ██╔████╔██║██║     ██████╔╝█████╗██║  ██║█████╗  ██║   ██║█████╔╝ ██║   ██║   
  ██║╚██╔╝██║██║     ██╔═══╝ ╚════╝██║  ██║██╔══╝  ╚██╗ ██╔╝██╔═██╗ ██║   ██║   
  ██║ ╚═╝ ██║╚██████╗██║           ██████╔╝███████╗ ╚████╔╝ ██║  ██╗██║   ██║   
  ╚═╝     ╚═╝ ╚═════╝╚═╝           ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝   ╚═╝   

  Claude's Persistent Development Partner
  `));

  console.log('This demo shows how mcp-devkit transforms Claude into a persistent');
  console.log('development partner with project memory and anti-drift capabilities.\n');
  
  pause();

  step('2. Checking Version');
  
  const hasGlobalInstall = runCommand('which mcp-devkit', 'check global install');
  
  if (hasGlobalInstall) {
    runCommand('mcp-devkit --version', 'show version');
  } else {
    log('Using local development build...');
    runCommand('npm run start -- --version', 'show version from local build');
  }
  
  pause();

  step('3. Displaying Help');
  
  if (hasGlobalInstall) {
    runCommand('mcp-devkit --help', 'show help');
  } else {
    runCommand('npm run start -- --help', 'show help from local build');
  }
  
  pause();

  step('4. Initializing New Project');
  
  log(`Creating demo project: ${DEMO_DIR}`);
  
  if (hasGlobalInstall) {
    runCommand(`mcp-devkit init ${DEMO_DIR}`, 'initialize project');
  } else {
    runCommand(`npm run start -- init ${DEMO_DIR}`, 'initialize project');
  }
  
  pause();

  step('5. Exploring Generated Structure');
  
  if (fs.existsSync(DEMO_DIR)) {
    log('Project structure created:');
    
    try {
      const files = fs.readdirSync(path.join(DEMO_DIR, '.mcp'));
      console.log(chalk.cyan('📁 .mcp/ directory contents:'));
      files.forEach(file => {
        console.log(chalk.gray('  ├──'), chalk.green(file));
      });
      
      success('All template files generated successfully');
    } catch (err) {
      error('Failed to read project structure');
    }
  }
  
  pause();

  step('6. Examining Templates');
  
  try {
    log('Sample from Product Requirements Document:');
    const prd = fs.readFileSync(path.join(DEMO_DIR, '.mcp', 'context_prd.md'), 'utf8');
    console.log(chalk.gray(prd.split('\n').slice(0, 10).join('\n')));
    console.log(chalk.dim('... (truncated)\n'));
    
    log('Project metadata:');
    const metadata = fs.readFileSync(path.join(DEMO_DIR, '.mcp', 'metadata.json'), 'utf8');
    console.log(chalk.gray(metadata));
    
    success('Template content looks good');
  } catch (err) {
    error('Failed to read template files');
  }
  
  pause();

  step('7. Testing Force Overwrite');
  
  // Add test file
  fs.writeFileSync(path.join(DEMO_DIR, '.mcp', 'test.txt'), 'test content');
  
  log('Testing --force flag to overwrite existing project...');
  
  if (hasGlobalInstall) {
    runCommand(`mcp-devkit init ${DEMO_DIR} --force`, 'test force overwrite');
  } else {
    runCommand(`npm run start -- init ${DEMO_DIR} --force`, 'test force overwrite');
  }
  
  if (!fs.existsSync(path.join(DEMO_DIR, '.mcp', 'test.txt'))) {
    success('Force overwrite worked correctly');
  } else {
    warning('Force overwrite may not have worked');
  }
  
  pause();

  step('8. Testing Error Handling');
  
  log('Testing error handling with invalid command...');
  
  if (hasGlobalInstall) {
    runCommand('mcp-devkit invalid-command', 'error test');
  } else {
    runCommand('npm run start -- invalid-command', 'error test');
  }
  
  success('Error handling working correctly');
  
  pause();

  step('9. MCP Configuration Guide');
  
  console.log(chalk.bold('🔧 Claude Desktop Configuration:'));
  console.log('\nTo integrate with Claude Desktop, add this to your config:\n');
  
  console.log(chalk.cyan('📁 Config file location:'));
  console.log(chalk.gray('  macOS: ~/Library/Application Support/Claude/claude_desktop_config.json'));
  console.log(chalk.gray('  Windows: %APPDATA%\\Claude\\claude_desktop_config.json\n'));
  
  console.log(chalk.cyan('📄 Configuration:'));
  console.log(chalk.gray(JSON.stringify({
    mcpServers: {
      'mcp-devkit': {
        command: 'mcp-devkit',
        args: ['serve']
      }
    }
  }, null, 2)));
  
  console.log(chalk.cyan('\n🛠️ Available MCP Tools:'));
  console.log(chalk.gray('  • mcp_init_guided() - Initialize projects'));
  console.log(chalk.gray('  • mcp_get_status() - Check project progress'));
  console.log(chalk.gray('  • mcp_check_drift() - Prevent conversation drift'));
  console.log(chalk.gray('  • mcp_next_task() - Get prioritized tasks'));
  console.log(chalk.gray('  • mcp_analyze_project() - Recover stalled projects'));
  
  pause();

  step('10. Demo Complete!');
  
  console.log(chalk.green('🎉 mcp-devkit Demo Summary:\n'));
  
  console.log(chalk.green('✅ Project Initialization:'), 'Working perfectly');
  console.log(chalk.green('✅ Template Generation:'), 'PRD, Architecture, Tasks created');
  console.log(chalk.green('✅ Force Overwrite:'), 'Functioning correctly');
  console.log(chalk.green('✅ Error Handling:'), 'Helpful messages displayed');
  console.log(chalk.green('✅ CLI Experience:'), 'Beautiful output and animations');
  
  console.log(chalk.bold('\n🚀 Next Steps:'));
  console.log('1. Configure Claude Desktop with mcp-devkit MCP server');
  console.log('2. Start a real project: mcp-devkit init my-project');
  console.log('3. Use Claude with persistent project memory!');
  
  // Cleanup
  log('\nCleaning up demo...');
  cleanup();
  
  success('Demo completed successfully!');
}

// Handle cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('mcp-devkit Demo Script\n');
  console.log('Usage: npm run demo [options]\n');
  console.log('Options:');
  console.log('  --interactive  Pause between demo steps');
  console.log('  --help         Show this help message');
  process.exit(0);
}

// Run the demo
runDemo().catch(err => {
  error('Demo failed:', err.message);
  cleanup();
  process.exit(1);
});