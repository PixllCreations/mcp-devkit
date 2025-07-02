import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const createServeCommand = (): Command => {
  return new Command('serve')
    .description('Start MCP server for Claude Desktop integration')
    .option('--port <number>', 'Port to run server on (for future HTTP support)', '3000')
    .option('--verbose', 'Enable verbose logging')
    .option('--debug', 'Enable debug mode with detailed logs')
    .action(async (options: { port?: string; verbose?: boolean; debug?: boolean }) => {
      console.log(chalk.cyan('\n🚀 Starting mcp-devkit MCP Server...\n'));
      
      // Get the path to the built server file
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const serverPath = path.join(__dirname, '../../../dist/mcp/server.js');
      
      console.log(chalk.bold('Server Configuration:'));
      console.log(chalk.gray('  Protocol:'), 'stdio (MCP standard)');
      console.log(chalk.gray('  Server:'), serverPath);
      if (options.verbose) {
        console.log(chalk.gray('  Verbose:'), 'enabled');
      }
      if (options.debug) {
        console.log(chalk.gray('  Debug:'), 'enabled');
      }
      console.log();
      
      // Display connection instructions
      displayConnectionInstructions();
      
      console.log(chalk.yellow('⚡ Server starting... Use Ctrl+C to stop\n'));
      
      // Set up environment variables
      const env = { ...process.env };
      if (options.verbose) {
        env['MCP_VERBOSE'] = 'true';
      }
      if (options.debug) {
        env['MCP_DEBUG'] = 'true';
      }
      
      // Start the MCP server
      try {
        const serverProcess = spawn('node', [serverPath], {
          stdio: 'inherit',
          env
        });
        
        // Handle server process events
        serverProcess.on('error', (error) => {
          console.error(chalk.red('\n✖ Failed to start MCP server:'), error.message);
          console.error(chalk.gray('\nTroubleshooting tips:'));
          console.error(chalk.gray('  • Ensure the project is built: npm run build'));
          console.error(chalk.gray('  • Check that Node.js is installed and accessible'));
          console.error(chalk.gray('  • Verify file permissions on the server script'));
          process.exit(1);
        });
        
        serverProcess.on('exit', (code, signal) => {
          if (signal === 'SIGINT' || signal === 'SIGTERM') {
            console.log(chalk.yellow('\n👋 MCP server stopped gracefully'));
          } else if (code !== 0) {
            console.error(chalk.red(`\n✖ MCP server exited with code ${code}`));
            console.error(chalk.gray('\nCheck the logs above for error details'));
          }
        });
        
        // Handle Ctrl+C gracefully
        process.on('SIGINT', () => {
          console.log(chalk.yellow('\n⏹️  Stopping MCP server...'));
          serverProcess.kill('SIGTERM');
        });
        
      } catch (error) {
        console.error(chalk.red('\n✖ Error starting server:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};

function displayConnectionInstructions() {
  console.log(chalk.bold('🔗 Claude Desktop Configuration:'));
  console.log(chalk.gray('Add the following to your Claude Desktop config file:\n'));
  
  console.log(chalk.blue('macOS:') + chalk.gray(' ~/Library/Application Support/Claude/claude_desktop_config.json'));
  console.log(chalk.blue('Windows:') + chalk.gray(' %APPDATA%\\Claude\\claude_desktop_config.json\n'));
  
  console.log(chalk.green('Configuration:'));
  console.log(chalk.gray('```json'));
  console.log(chalk.white(`{
  "mcpServers": {
    "mcp-devkit": {
      "command": "mcp-devkit",
      "args": ["serve"]
    }
  }
}`));
  console.log(chalk.gray('```\n'));
  
  console.log(chalk.bold('📋 Next Steps:'));
  console.log(chalk.gray('  1. ') + 'Add the configuration above to Claude Desktop');
  console.log(chalk.gray('  2. ') + 'Restart Claude Desktop');
  console.log(chalk.gray('  3. ') + 'Start a new conversation - Claude will have access to mcp-devkit tools');
  console.log(chalk.gray('  4. ') + 'Try: "Initialize a new project with mcp-devkit"\n');
  
  console.log(chalk.dim('💡 Tip: Use `mcp-devkit demo` for an interactive tutorial\n'));
}