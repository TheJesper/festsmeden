#!/usr/bin/env node
/**
 * Festsmeden Interactive Menu
 * Wave-style CLI menu for common development tasks
 */

const { execSync, spawn } = require('child_process');
const readline = require('readline');

const MENU_ITEMS = [
  { key: '1', label: 'Start MVP Server (port 9558)', command: 'cd mvp/extracted/festsmeden && npm install && node server.js' },
  { key: '2', label: 'Open in Browser', command: 'start http://localhost:9558' },
  { key: '3', label: 'Git Status', command: 'git status' },
  { key: '4', label: 'Git Pull', command: 'git pull' },
  { key: '5', label: 'Git Push', command: 'git push' },
  { key: 'q', label: 'Quit', command: null }
];

function printMenu() {
  console.log('\n========================================');
  console.log('  FESTSMEDEN - Party Planner');
  console.log('========================================\n');

  MENU_ITEMS.forEach(item => {
    console.log(`  [${item.key}] ${item.label}`);
  });

  console.log('\n----------------------------------------');
  process.stdout.write('Select option: ');
}

function runCommand(cmd) {
  console.log(`\nRunning: ${cmd}\n`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error('Command failed');
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt() {
  printMenu();
  rl.once('line', (input) => {
    const choice = input.trim().toLowerCase();
    const item = MENU_ITEMS.find(m => m.key === choice);

    if (!item) {
      console.log('Invalid option');
      prompt();
      return;
    }

    if (item.command === null) {
      console.log('Goodbye!');
      rl.close();
      process.exit(0);
    }

    runCommand(item.command);
    prompt();
  });
}

prompt();
