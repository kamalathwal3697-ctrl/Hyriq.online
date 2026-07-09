const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const WATCH_DIR = path.join(__dirname, 'next-app', 'src'); // Watch source code folder
const DEBOUNCE_DELAY = 10000; // Wait 10 seconds after the last change before pushing
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /\.vercel/
];

let timeoutId = null;
let changedFiles = new Set();

function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command}`);
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${command}:`, stderr || error.message);
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

async function performAutoPush() {
  console.log(`\n--- Auto-Push Triggered at ${new Date().toLocaleTimeString()} ---`);
  console.log(`Changes detected in:`, Array.from(changedFiles));
  
  try {
    // Stage changes
    await runCommand('git add .');
    
    // Commit changes
    const commitMsg = `Auto-push: updates to ${changedFiles.size} file(s) at ${new Date().toLocaleTimeString()}`;
    await runCommand(`git commit -m "${commitMsg}"`);
    
    // Push changes to main branch
    await runCommand('git push origin main');
    
    console.log('--- Auto-Push Completed Successfully! ---\n');
  } catch (err) {
    console.error('Auto-Push failed. Retrying on next save.\n');
  } finally {
    // Clear list of changes
    changedFiles.clear();
  }
}

function handleFileChange(eventType, filename) {
  if (!filename) return;
  
  const fullPath = path.join(WATCH_DIR, filename);
  
  // Check exclusions
  if (EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
    return;
  }
  
  changedFiles.add(filename);
  
  // Reset debounce timer
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  
  console.log(`[Change Detected] ${filename} (${eventType}). Scheduling auto-push in ${DEBOUNCE_DELAY / 1000}s...`);
  
  timeoutId = setTimeout(() => {
    performAutoPush();
  }, DEBOUNCE_DELAY);
}

// Start watching recursively (Windows supports recursive watch natively in fs.watch)
if (fs.existsSync(WATCH_DIR)) {
  console.log(`==================================================`);
  console.log(`  Auto-Push Watcher active for: ${WATCH_DIR}`);
  console.log(`  Waiting for file changes... (Debounce: ${DEBOUNCE_DELAY / 1000}s)`);
  console.log(`==================================================`);
  
  fs.watch(WATCH_DIR, { recursive: true }, handleFileChange);
} else {
  console.error(`Error: Watch directory does not exist: ${WATCH_DIR}`);
}
