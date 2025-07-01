import { describe, it, expect } from 'vitest';
import { Validator, validatorRegistry, builtinPlugin, ValidationSeverity } from '../../src/core/validators/index.js';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Validator', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = join(tmpdir(), `mcp-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    
    // Clear registry and register built-in plugin
    validatorRegistry.clear();
    validatorRegistry.register(builtinPlugin);
  });

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  it('should validate markdown files correctly', async () => {
    const validator = new Validator();
    
    // Create test markdown file with issues
    const testFile = join(testDir, 'test.md');
    const content = `# Test Document

## Empty Section

## TODO Section
This section has TODO placeholder text.

## Valid Section
This section has actual content.

- [ ] Task 1
- [x] Completed task
- [?] Invalid checkbox

[Empty link]()
[Valid link](https://example.com)
`;
    
    await writeFile(testFile, content);
    
    // Validate the file
    const report = await validator.validateFile(testFile, testDir);
    
    expect(report.valid).toBe(false);
    expect(report.issues.length).toBeGreaterThan(0);
    
    // Check for specific issues
    const errorMessages = report.issues.map(i => i.message);
    expect(errorMessages.some(msg => msg.includes('Empty section'))).toBe(true);
    expect(errorMessages.some(msg => msg.includes('TODO'))).toBe(true);
    expect(errorMessages.some(msg => msg.includes('Invalid checkbox'))).toBe(true);
  });

  it('should validate JSON schema correctly', async () => {
    const validator = new Validator();
    
    // Create test JSON file
    const testFile = join(testDir, 'package.json');
    const content = `{
  "name": "",
  "version": "not-semantic",
  "description": "Test package"
}`;
    
    await writeFile(testFile, content);
    
    // Note: Since we don't have a package.json schema in our test setup,
    // this would just validate as JSON (which it is)
    const report = await validator.validateFile(testFile, testDir);
    
    // The file should be valid JSON, so no parsing errors
    expect(report.issues.filter(i => i.severity === ValidationSeverity.ERROR).length).toBe(0);
  });

  it('should validate entire project', async () => {
    const validator = new Validator();
    
    // Create test project structure
    const mcpDir = join(testDir, '.mcp');
    await mkdir(mcpDir, { recursive: true });
    
    // Create multiple test files
    await writeFile(join(mcpDir, 'valid.md'), '# Valid Document\n\nThis is a valid document with content.');
    await writeFile(join(mcpDir, 'invalid.md'), '# Invalid Document\n\n## TODO\n\n## Empty Section\n');
    
    // Validate entire project
    const summary = await validator.validateProject(testDir);
    
    expect(summary.totalFiles).toBe(2);
    expect(summary.validFiles).toBeGreaterThanOrEqual(1);
    expect(summary.totalIssues).toBeGreaterThan(0);
    
    // Check that at least one file has issues
    const filesWithIssues = summary.reports.filter(r => r.issues.length > 0);
    expect(filesWithIssues.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle different output formats', async () => {
    const validator = new Validator();
    
    // Create test file
    const testFile = join(testDir, 'test.md');
    await writeFile(testFile, '# Test\n\n## TODO\n');
    
    const report = await validator.validateFile(testFile, testDir);
    
    // Should have proper structure for different output formats
    expect(report).toHaveProperty('filePath');
    expect(report).toHaveProperty('valid');
    expect(report).toHaveProperty('issues');
    expect(report).toHaveProperty('executionTime');
    expect(report).toHaveProperty('validator');
    
    expect(Array.isArray(report.issues)).toBe(true);
    expect(typeof report.executionTime).toBe('number');
    expect(report.validator).toBe('mcp-devkit');
  });

  it('should support rule filtering', async () => {
    const validator = new Validator({
      rules: ['markdown']
    });
    
    // Create test file
    const testFile = join(testDir, 'test.md');
    await writeFile(testFile, '# Test\n\n## TODO\n');
    
    const report = await validator.validateFile(testFile, testDir);
    
    // Should only run markdown rules
    expect(report.issues.every(issue => issue.rule === 'markdown')).toBe(true);
  });
});