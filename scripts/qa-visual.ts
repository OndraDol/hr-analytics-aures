import { spawnSync } from 'node:child_process';
import process from 'node:process';

if (process.platform === 'android') {
  console.warn('Skipping Playwright visual QA: Playwright browsers are not supported on Android/Termux.');
  console.warn('Run this command on Linux/macOS/Windows or in CI to execute browser screenshots.');
  process.exit(0);
}

const result = spawnSync('playwright', ['test'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
