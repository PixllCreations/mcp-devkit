import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('CLI Integration Tests', () => {
  const testProjectDir = path.join(process.cwd(), 'test-integration-project');
  const cliPath = path.join(__dirname, '../../index.ts');

  beforeEach(async () => {
    // Clean up any existing test directory
    try {
      await fs.rm(testProjectDir, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testProjectDir, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  describe('mcp-devkit --version', () => {
    it('should display version number', () => {
      try {
        execSync(`npx tsx ${cliPath} --version`, { encoding: 'utf-8' });
      } catch (error: any) {
        // Commander.js exits with status 1, but stdout contains the version
        expect(error.stdout).toContain('0.1.0');
      }
    });
  });

  describe('mcp-devkit --help', () => {
    it('should display help information', () => {
      try {
        execSync(`npx tsx ${cliPath} --help`, { encoding: 'utf-8' });
      } catch (error: any) {
        // Commander.js exits with status 1, but stdout contains the help
        expect(error.stdout).toContain('mcp-devkit');
        expect(error.stdout).toContain('Claude\'s Persistent Development Partner');
        expect(error.stdout).toContain('Commands:');
        expect(error.stdout).toContain('init');
      }
    });
  });

  describe('mcp-devkit init', () => {
    it('should initialize a new project with default template', async () => {
      // Create the test directory
      await fs.mkdir(testProjectDir, { recursive: true });

      // Run init command
      const output = execSync(
        `npx tsx ${cliPath} init ${testProjectDir}`,
        { encoding: 'utf-8' }
      );

      // Check output - CLI shows detailed project structure output
      expect(output).toContain('📁 Project Structure Created');

      // Check that .mcp directory was created
      const mcpDir = path.join(testProjectDir, '.mcp');
      const mcpExists = await fs.access(mcpDir).then(() => true).catch(() => false);
      expect(mcpExists).toBe(true);

      // Check that all required files exist
      const requiredFiles = [
        'context_prd.md',
        'context_architecture.md',
        'context_tasklist.md',
        'metadata.json',
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(mcpDir, file);
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(fileExists, `File ${file} should exist`).toBe(true);
      }

      // Check metadata content
      const metadataPath = path.join(mcpDir, 'metadata.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);

      expect(metadata).toHaveProperty('templateType', 'default');
      expect(metadata).toHaveProperty('version', '0.1.0');
      expect(metadata).toHaveProperty('phase', 'planning');
    });

    it('should handle --force option for existing .mcp directory', async () => {
      // Create the test directory with existing .mcp
      await fs.mkdir(testProjectDir, { recursive: true });
      const mcpDir = path.join(testProjectDir, '.mcp');
      await fs.mkdir(mcpDir, { recursive: true });
      await fs.writeFile(path.join(mcpDir, 'existing.txt'), 'test content');

      // Run init command with --force
      // The CLI outputs progress to stderr, so we need to capture both stdout and stderr
      let output = '';
      try {
        output = execSync(
          `npx tsx ${cliPath} init ${testProjectDir} --force 2>&1`,
          { encoding: 'utf-8' }
        );
      } catch (error: any) {
        output = error.stdout + error.stderr;
      }

      expect(output).toContain('⚠ Removed existing .mcp directory');
      expect(output).toContain('📁 Project Structure Created');

      // Check that old file is gone
      const oldFileExists = await fs.access(path.join(mcpDir, 'existing.txt'))
        .then(() => true)
        .catch(() => false);
      expect(oldFileExists).toBe(false);

      // Check that new files exist
      const prdExists = await fs.access(path.join(mcpDir, 'context_prd.md'))
        .then(() => true)
        .catch(() => false);
      expect(prdExists).toBe(true);
    });

    it('should fail without --force when .mcp exists', async () => {
      // Create the test directory with existing .mcp
      await fs.mkdir(testProjectDir, { recursive: true });
      const mcpDir = path.join(testProjectDir, '.mcp');
      await fs.mkdir(mcpDir, { recursive: true });

      // Run init command without --force
      const output = execSync(
        `npx tsx ${cliPath} init ${testProjectDir}`,
        { encoding: 'utf-8' }
      );

      expect(output).toContain('Use --force to overwrite existing .mcp directory');
    });

    it('should create project in current directory with . argument', async () => {
      const currentDir = process.cwd();
      const testDir = path.join(currentDir, 'test-current-dir');
      
      await fs.mkdir(testDir, { recursive: true });
      
      // Change to test directory and run init with .
      const output = execSync(
        `cd ${testDir} && npx tsx ${cliPath} init .`,
        { encoding: 'utf-8' }
      );

      expect(output).toContain('📁 Project Structure Created');

      // Check that .mcp was created in the test directory
      const mcpExists = await fs.access(path.join(testDir, '.mcp'))
        .then(() => true)
        .catch(() => false);
      expect(mcpExists).toBe(true);

      // Clean up
      await fs.rm(testDir, { recursive: true });
    });

    it('should display beautiful ASCII art banner', () => {
      const output = execSync(
        `npx tsx ${cliPath} init ${testProjectDir}`,
        { encoding: 'utf-8' }
      );

      expect(output).toContain('███╗   ███╗ ██████╗██████╗');
      expect(output).toContain('Claude\'s Persistent Development Partner');
    });

    it('should show next steps after initialization', () => {
      const output = execSync(
        `npx tsx ${cliPath} init ${testProjectDir}`,
        { encoding: 'utf-8' }
      );

      expect(output).toContain('🚀 Next Steps:');
      expect(output).toContain('Review Templates');
      expect(output).toContain('Define Your Project');
    });
  });

  describe('mcp-devkit unknown command', () => {
    it('should show error for unknown commands', () => {
      let error = '';
      try {
        execSync(`npx tsx ${cliPath} invalid-command`, { encoding: 'utf-8' });
      } catch (e: any) {
        error = e.stdout || e.stderr || '';
      }

      expect(error).toContain('Unknown command: invalid-command');
      expect(error).toContain('Run');
      expect(error).toContain('mcp-devkit --help');
    });
  });
});