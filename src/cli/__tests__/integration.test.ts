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
      const output = execSync(`npx tsx ${cliPath} --version`, { encoding: 'utf-8' });
      expect(output).toContain('0.1.0');
    });
  });

  describe('mcp-devkit --help', () => {
    it('should display help information', () => {
      const output = execSync(`npx tsx ${cliPath} --help`, { encoding: 'utf-8' });
      expect(output).toContain('mcp-devkit');
      expect(output).toContain('Claude\'s Persistent Development Partner');
      expect(output).toContain('Commands:');
      expect(output).toContain('init');
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

      // Check output
      expect(output).toContain('mcp-devkit project initialized successfully');

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
      const output = execSync(
        `npx tsx ${cliPath} init ${testProjectDir} --force`,
        { encoding: 'utf-8' }
      );

      expect(output).toContain('Removed existing .mcp directory');
      expect(output).toContain('mcp-devkit project initialized successfully');

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

      expect(output).toContain('.mcp directory already exists');
      expect(output).toContain('Use --force to overwrite');
    });

    it('should create project in current directory with . argument', async () => {
      const currentDir = process.cwd();
      const testDir = path.join(currentDir, 'test-current-dir');
      
      await fs.mkdir(testDir, { recursive: true });
      
      // Change to test directory and run init with .
      const output = execSync(
        `cd ${testDir} && npx tsx ${cliPath} init .`,
        { encoding: 'utf-8', shell: true }
      );

      expect(output).toContain('mcp-devkit project initialized successfully');

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

      expect(output).toContain('Next steps:');
      expect(output).toContain('Review the generated templates');
      expect(output).toContain('Fill out the project requirements');
      expect(output).toContain('mcp-devkit validate');
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