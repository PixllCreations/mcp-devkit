import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { TemplateManager } from '../../../core/templates/manager.js';
import { Logger } from '../../../utils/logger.js';

describe('init command', () => {
  const testDir = path.join(process.cwd(), 'test-temp');
  const mcpDir = path.join(testDir, '.mcp');

  beforeEach(async () => {
    // Clean up any existing test directory
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  describe('TemplateManager', () => {
    it('should create .mcp directory structure', async () => {
      const logger = new Logger(false);
      const templateManager = new TemplateManager(logger);

      await templateManager.initializeProject(mcpDir, 'default');

      // Check that .mcp directory was created
      const mcpExists = await fs.access(mcpDir).then(() => true).catch(() => false);
      expect(mcpExists).toBe(true);

      // Check that archive subdirectory was created
      const archiveExists = await fs.access(path.join(mcpDir, 'archive')).then(() => true).catch(() => false);
      expect(archiveExists).toBe(true);
    });

    it('should create required context files', async () => {
      const logger = new Logger(false);
      const templateManager = new TemplateManager(logger);

      await templateManager.initializeProject(mcpDir, 'default');

      // Check that required files were created
      const files = ['context_prd.md', 'context_architecture.md', 'context_tasklist.md', 'metadata.json'];
      
      for (const file of files) {
        const filePath = path.join(mcpDir, file);
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(fileExists, `File ${file} should exist`).toBe(true);
      }
    });

    it('should create valid PRD template', async () => {
      const logger = new Logger(false);
      const templateManager = new TemplateManager(logger);

      await templateManager.initializeProject(mcpDir, 'default');

      const prdContent = await fs.readFile(path.join(mcpDir, 'context_prd.md'), 'utf-8');
      
      // Check that PRD contains expected sections
      expect(prdContent).toContain('# Product Requirements Document');
      expect(prdContent).toContain('## 📋 Project Overview');
      expect(prdContent).toContain('### Problem Statement');
      expect(prdContent).toContain('## 👥 Target Users');
      expect(prdContent).toContain('## 🎯 Core Requirements');
    });

    it('should create valid metadata.json', async () => {
      const logger = new Logger(false);
      const templateManager = new TemplateManager(logger);

      await templateManager.initializeProject(mcpDir, 'default');

      const metadataContent = await fs.readFile(path.join(mcpDir, 'metadata.json'), 'utf-8');
      const metadata = JSON.parse(metadataContent);
      
      // Check metadata structure
      expect(metadata).toHaveProperty('templateType', 'default');
      expect(metadata).toHaveProperty('version', '0.1.0');
      expect(metadata).toHaveProperty('created');
      expect(metadata).toHaveProperty('phase', 'planning');
      expect(metadata).toHaveProperty('agents');
      expect(metadata.agents).toHaveProperty('claude');
      expect(metadata.agents.claude).toHaveProperty('enabled', true);
    });

    it('should handle different template types', async () => {
      const logger = new Logger(false);
      const templateManager = new TemplateManager(logger);

      await templateManager.initializeProject(mcpDir, 'custom');

      const metadataContent = await fs.readFile(path.join(mcpDir, 'metadata.json'), 'utf-8');
      const metadata = JSON.parse(metadataContent);
      
      expect(metadata.templateType).toBe('custom');
    });
  });

  describe('error handling', () => {
    it('should handle permission errors gracefully', async () => {
      const logger = new Logger(false);
      const templateManager = new TemplateManager(logger);

      // Try to create in a location that might have permission issues
      const invalidPath = '/root/test-mcp-invalid';
      
      await expect(templateManager.initializeProject(invalidPath, 'default'))
        .rejects.toThrow();
    });

    it('should handle existing directory', async () => {
      const logger = new Logger(false);
      const templateManager = new TemplateManager(logger);

      // Create directory first
      await fs.mkdir(testDir, { recursive: true });
      await fs.mkdir(mcpDir, { recursive: true });
      await fs.writeFile(path.join(mcpDir, 'existing.txt'), 'test');

      // Should still work (overwrite)
      await expect(templateManager.initializeProject(mcpDir, 'default'))
        .resolves.not.toThrow();
      
      // Check that the template files exist
      const prdExists = await fs.access(path.join(mcpDir, 'context_prd.md')).then(() => true).catch(() => false);
      expect(prdExists).toBe(true);
    });
  });
});