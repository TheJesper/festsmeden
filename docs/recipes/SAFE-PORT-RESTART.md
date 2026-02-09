# Safe Port Restart Recipe

## Problem
When restarting a dev server, port conflicts occur because the previous process is still running. Naive solutions like `taskkill /F /IM node.exe` kill ALL node processes including Claude sessions.

## Solution: PID-Based Port Cleanup

**NEVER kill all node processes. ONLY kill the specific PID using that port.**

### The Pattern

```javascript
import { exec } from 'child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);
const PID_FILE = '.server.pid';  // Store in project root
const PORT = 3000;  // Your dev server port

// Kill process on specific port (safe - only kills exact PID)
async function killPort(port) {
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      if (stdout) {
        const pids = new Set();
        stdout.split('\n').forEach(line => {
          const match = line.match(/LISTENING\s+(\d+)/);
          if (match) pids.add(match[1]);
        });

        for (const pid of pids) {
          console.log(`Killing PID ${pid} on port ${port}...`);
          try {
            // SAFE: Only kills THIS specific PID and its children
            await execAsync(`taskkill //F //T //PID ${pid}`);
          } catch (e) {
            // Process may already be dead
          }
        }
        // Wait for cleanup
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      // No processes on port
    }
  } else {
    // Unix/Mac
    try {
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      if (stdout) {
        for (const pid of stdout.trim().split('\n')) {
          await execAsync(`kill -9 ${pid}`);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err) {
      // No processes on port
    }
  }
}

// Save current server PID
function savePid(pid) {
  writeFileSync(PID_FILE, JSON.stringify({ pid, port: PORT, timestamp: Date.now() }));
}

// Kill from saved PID (backup method)
async function killSavedPid() {
  try {
    if (existsSync(PID_FILE)) {
      const { pid } = JSON.parse(readFileSync(PID_FILE, 'utf8'));
      if (pid) {
        console.log(`Killing saved PID ${pid}...`);
        if (process.platform === 'win32') {
          await execAsync(`taskkill //F //T //PID ${pid}`);
        } else {
          await execAsync(`kill -9 ${pid}`);
        }
      }
      unlinkSync(PID_FILE);
    }
  } catch (e) {
    // Ignore errors
  }
}

// Start server with safe restart
async function startServer() {
  // Step 1: Kill any saved PID from previous run
  await killSavedPid();

  // Step 2: Kill any process on port (catches orphans)
  await killPort(PORT);

  // Step 3: Start server
  const server = spawn('npm', ['run', 'dev'], { /* options */ });

  // Step 4: Save PID for next restart
  savePid(server.pid);

  return server;
}
```

### Key Safety Rules

1. **NEVER use `taskkill /F /IM node.exe`** - Kills ALL node including Claude
2. **ALWAYS use `taskkill //F //T //PID {specific-pid}`** - Only kills that process
3. **Double-slash in bash** - `//F` not `/F` (bash path escaping)
4. **Use `/T` flag** - Kills child processes too (process tree)
5. **Wait after kill** - 2-3 seconds for cleanup before restart
6. **Port lookup first** - Use netstat to find exact PID on port

### Danger Zone Commands (NEVER USE)

```bash
# FORBIDDEN - Kills Claude and all agents:
taskkill /F /IM node.exe
pkill node
killall node
Get-Process node | Stop-Process

# SAFE - Only kills specific process:
taskkill //F //T //PID 12345
```

### Implementation Checklist

- [ ] Create PID file path (e.g., `.server.pid`)
- [ ] Add `killPort(port)` function with netstat lookup
- [ ] Add `savePid(pid)` to track current server
- [ ] Add `killSavedPid()` as backup cleanup
- [ ] Call cleanup before starting server
- [ ] Wait 2-3 seconds after killing before restart
- [ ] Handle both Windows and Unix

### Example Projects Using This Pattern

- `D:\02.Lab\luncho\luncho-raider\menu.js` - Full implementation
- `tools\agent-starter\agent-launcher.js` - Simpler version

### Package.json Script Example

```json
{
  "scripts": {
    "dev": "node scripts/safe-start.js",
    "menu": "node menu.js",
    "menu:1": "node menu.js 1"
  }
}
```
