import { BaseValidationRule } from './base.js';
import { ValidationContext, ValidationResult, ValidationSeverity, ValidationIssue } from './types.js';

/**
 * Validates markdown files for common issues
 */
export class MarkdownValidator extends BaseValidationRule {
  constructor() {
    super('markdown', 'Validates markdown files for structure and content issues');
  }

  async validate(context: ValidationContext): Promise<ValidationResult> {
    // Only validate markdown files
    if (!context.filePath.endsWith('.md')) {
      return this.createResult(true);
    }

    const issues: ValidationIssue[] = [];
    const content = context.content;
    const lines = content.split('\n');

    // Run all validation checks
    issues.push(...this.checkEmptySections(lines));
    issues.push(...this.checkPlaceholderText(lines));
    issues.push(...this.checkRequiredSections(lines, context.filePath));
    issues.push(...this.checkCheckboxFormat(lines));
    issues.push(...this.checkHeadingStructure(lines));
    issues.push(...this.checkLinkIntegrity(lines));

    const hasErrors = issues.some(issue => issue.severity === ValidationSeverity.ERROR);
    return this.createResult(!hasErrors, issues);
  }

  /**
   * Check for empty sections (headers with no content)
   */
  private checkEmptySections(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      
      // Check if this is a header
      const headerMatch = line?.match(/^(#{1,6})\s+(.+)$/);
      if (!headerMatch) continue;
      
      const headerLevel = headerMatch[1]?.length ?? 0;
      const headerText = headerMatch[2] ?? '';
      
      // Look for content after this header
      let hasContent = false;
      
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j]?.trim();
        
        // Skip empty lines
        if (!nextLine) continue;
        
        // Check if we hit another header of same or higher level
        const nextHeaderMatch = nextLine?.match(/^(#{1,6})\s+/);
        if (nextHeaderMatch && (nextHeaderMatch[1]?.length ?? 0) <= headerLevel) {
          break;
        }
        
        // Found content
        hasContent = true;
        break;
      }
      
      if (!hasContent) {
        issues.push(this.createIssue(
          `Empty section: "${headerText}" has no content`,
          ValidationSeverity.WARNING,
          i + 1,
          undefined,
          'Add content to this section or remove the header'
        ));
      }
    }
    
    return issues;
  }

  /**
   * Check for placeholder text that should be replaced
   */
  private checkPlaceholderText(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const placeholders = [
      /TODO\s*:?\s*/i,
      /FIXME\s*:?\s*/i,
      /XXX\s*:?\s*/i,
      /\[TODO\]/i,
      /\[FIXME\]/i,
      /\{\{[^}]+\}\}/,  // Template variables like {{name}}
      /\$\{[^}]+\}/,    // Environment variables like ${PROJECT_NAME}
      /<[A-Z_]+>/,      // Placeholder tags like <PROJECT_NAME>
      /Your\s+(?:project|name|description|etc)/i,
      /Replace\s+(?:this|with)/i,
      /Enter\s+(?:your|the)/i
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      for (const placeholder of placeholders) {
        const match = line.match(placeholder);
        if (match && match[0]) {
          const matchText = match[0];
          issues.push(this.createIssue(
            `Placeholder text found: "${matchText}"`,
            ValidationSeverity.WARNING,
            i + 1,
            line.indexOf(matchText) + 1,
            'Replace placeholder text with actual content'
          ));
        }
      }
    }

    return issues;
  }

  /**
   * Check for required sections based on file type
   */
  private checkRequiredSections(lines: string[], filePath: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const content = lines.join('\n').toLowerCase();
    
    // Determine required sections based on file name
    const fileName = filePath.split('/').pop()?.toLowerCase() ?? '';
    
    let requiredSections: string[] = [];
    
    if (fileName === 'readme.md') {
      requiredSections = ['# ', '## installation', '## usage'];
    } else if (fileName.includes('prd') || fileName.includes('requirements')) {
      requiredSections = ['# ', '## overview', '## requirements'];
    } else if (fileName.includes('architecture')) {
      requiredSections = ['# ', '## architecture', '## components'];
    } else if (fileName.includes('task') || fileName.includes('todo')) {
      requiredSections = ['# ', '## tasks'];
    }
    
    // Check for required sections
    for (const section of requiredSections) {
      if (!content.includes(section.toLowerCase())) {
        issues.push(this.createIssue(
          `Missing required section: "${section}"`,
          ValidationSeverity.ERROR,
          undefined,
          undefined,
          `Add a "${section}" section to the document`
        ));
      }
    }
    
    return issues;
  }

  /**
   * Check checkbox format in task lists
   */
  private checkCheckboxFormat(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      // Look for checkbox-like patterns
      const checkboxMatch = line.match(/^(\s*)-\s*\[(.)\]\s*(.+)$/);
      if (!checkboxMatch) continue;
      
      const checkbox = checkboxMatch[2] ?? '';
      const text = checkboxMatch[3] ?? '';
      
      // Check for valid checkbox states
      if (![' ', 'x', 'X'].includes(checkbox)) {
        issues.push(this.createIssue(
          `Invalid checkbox format: "[${checkbox}]" should be "[ ]" or "[x]"`,
          ValidationSeverity.ERROR,
          i + 1,
          line.indexOf(`[${checkbox}]`) + 1,
          `Replace "[${checkbox}]" with "[ ]" for unchecked or "[x]" for checked`
        ));
      }
      
      // Check for empty task text
      if (!text?.trim()) {
        issues.push(this.createIssue(
          'Empty task: checkbox has no description',
          ValidationSeverity.WARNING,
          i + 1,
          undefined,
          'Add a description for this task'
        ));
      }
    }
    
    return issues;
  }

  /**
   * Check heading structure (proper hierarchy)
   */
  private checkHeadingStructure(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    let lastLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      const trimmedLine = line.trim();
      const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      
      if (!headerMatch) continue;
      
      const currentLevel = headerMatch[1]?.length ?? 0;
      const headerText = headerMatch[2] ?? '';
      
      // Check for heading level jumps (e.g., # to ###)
      if (lastLevel > 0 && currentLevel > lastLevel + 1) {
        issues.push(this.createIssue(
          `Heading level jump: jumped from H${lastLevel} to H${currentLevel}`,
          ValidationSeverity.WARNING,
          i + 1,
          undefined,
          `Use H${lastLevel + 1} instead of H${currentLevel}`
        ));
      }
      
      // Check for empty heading text
      if (!headerText?.trim()) {
        issues.push(this.createIssue(
          'Empty heading: heading has no text',
          ValidationSeverity.ERROR,
          i + 1,
          (headerMatch[1]?.length ?? 0) + 2,
          'Add text to the heading'
        ));
      }
      
      lastLevel = currentLevel;
    }
    
    return issues;
  }

  /**
   * Check for broken or suspicious links
   */
  private checkLinkIntegrity(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      // Find markdown links [text](url)
      const linkMatches = line.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g);
      
      for (const match of linkMatches) {
        const linkText = match[1] ?? '';
        const linkUrl = match[2] ?? '';
        const linkStart = match.index ?? 0;
        
        // Check for empty link text
        if (!linkText?.trim()) {
          issues.push(this.createIssue(
            'Empty link text',
            ValidationSeverity.WARNING,
            i + 1,
            linkStart + 1,
            'Add descriptive text for the link'
          ));
        }
        
        // Check for suspicious URLs
        if (linkUrl?.includes('localhost') || linkUrl?.includes('127.0.0.1')) {
          issues.push(this.createIssue(
            `Local URL in link: "${linkUrl}"`,
            ValidationSeverity.WARNING,
            i + 1,
            linkStart + (linkText?.length ?? 0) + 3,
            'Replace with a public URL or relative path'
          ));
        }
        
        // Check for placeholder URLs
        if (linkUrl?.includes('example.com') || linkUrl === '#' || linkUrl === 'TODO') {
          issues.push(this.createIssue(
            `Placeholder URL: "${linkUrl}"`,
            ValidationSeverity.WARNING,
            i + 1,
            linkStart + (linkText?.length ?? 0) + 3,
            'Replace with the actual URL'
          ));
        }
      }
    }
    
    return issues;
  }
}