#!/usr/bin/env node

// Simple test script to demonstrate interactive mode
import { spawn } from 'child_process';
import fs from 'fs/promises';

console.log('🧪 Testing Interactive Mode');
console.log('Creating test project with simulated input...\n');

// Create test directory
const testDir = '/tmp/mcp-test-interactive';
try {
  await fs.rm(testDir, { recursive: true, force: true });
} catch {}
await fs.mkdir(testDir, { recursive: true });

// Simulate user input
const inputs = [
  'My Awesome App',                    // Project name
  'Task management for busy people',   // Problem statement  
  'Busy professionals and students',   // Target audience
  'Task creation, Due dates, Tags',    // Key features
  'web-app',                          // Project type
  'React, Node.js, PostgreSQL',       // Tech stack
  'React frontend with Express API',   // Architecture
  'PostgreSQL',                       // Database
  'Vercel',                          // Deployment
  'Setup',                           // Phase 1 name
  'Create React app, Setup database', // Phase 1 tasks
  'Core Features',                   // Phase 2 name
  'Build UI, Add auth, Task CRUD',    // Phase 2 tasks
  '',                                // End phases
];

console.log('Simulated responses:');
inputs.forEach((input, i) => {
  if (input) console.log(`  ${i + 1}. "${input}"`);
});
console.log('\nRunning interactive init...\n');

const child = spawn('mcp-devkit', ['init', '--interactive', testDir], {
  stdio: ['pipe', 'inherit', 'inherit']
});

// Send inputs with delays
let inputIndex = 0;
const sendInput = () => {
  if (inputIndex < inputs.length) {
    const input = inputs[inputIndex];
    setTimeout(() => {
      child.stdin.write(input + '\n');
      inputIndex++;
      sendInput();
    }, 500); // 500ms delay between inputs
  } else {
    child.stdin.end();
  }
};

child.on('spawn', () => {
  setTimeout(sendInput, 2000); // Wait 2s for initialization
});

child.on('close', async (code) => {
  console.log(`\n✅ Interactive mode completed with code: ${code}`);
  
  if (code === 0) {
    console.log('\n📁 Generated files:');
    try {
      const files = await fs.readdir(`${testDir}/.mcp`);
      for (const file of files) {
        if (file.endsWith('.md')) {
          console.log(`  ✓ ${file}`);
        }
      }
      
      console.log('\n📋 Sample PRD content:');
      const prd = await fs.readFile(`${testDir}/.mcp/context_prd.md`, 'utf-8');
      console.log(prd.split('\n').slice(0, 10).join('\n') + '...\n');
      
    } catch (error) {
      console.error('Error reading generated files:', error.message);
    }
  }
});

child.on('error', (error) => {
  console.error('Error running interactive mode:', error.message);
});