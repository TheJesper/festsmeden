# VIZ Page Setup Recipe

Complete setup guide for creating VIZ pages with VUK theme, WaveMenu, and safe port handling.

## Quick Start

```bash
# 1. Copy the VIZ starter from templates
cp -r W:/workprocess/_agent-orchestration/templates/viz-starter ./web

# 2. Update port in config
# Edit web/viz.config.json

# 3. Install and run
cd web && npm install && npm run dev
```

## What's Included

| Component | Description |
|-----------|-------------|
| VUK Theme | Solarized colors, monospace font, FatCow icons |
| WaveMenu | Interactive menu.js with dev/prod/test options |
| Safe Port | PID tracking, safe restart without killing agents |
| Port Registry | Auto-allocation from central registry |

## Manual Setup

### 1. Create Next.js Project

```bash
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir=false
cd web
```

### 2. Add VUK Theme Dependency

```json
// package.json
{
  "dependencies": {
    "@viz/shadcn-theme": "file:../../../../code/vuk"
  }
}
```

### 3. Configure Tailwind for VUK

```javascript
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@viz/shadcn-theme/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // VUK Solarized
        'page-bg': '#fdf6e3',
        'card-bg': '#eee8d5',
        'border': '#d3cbb7',
        'text-primary': '#073642',
        'text-muted': '#657b83',
        'accent-blue': '#268bd2',
        'accent-green': '#859900',
        'accent-yellow': '#b58900',
        'accent-red': '#dc322f',
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 4. Create viz.config.json

```json
{
  "name": "My VIZ Page",
  "port": 9556,
  "project_id": "my-project",
  "version": "1.0.0"
}
```

### 5. Add Safe Port Handler

Create `scripts/safe-port.js`:

```javascript
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);
const PID_FILE = path.join(__dirname, '..', '.server.pid');

async function killPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const pids = new Set();

    stdout.split('\n').forEach(line => {
      const match = line.match(/LISTENING\s+(\d+)/);
      if (match) pids.add(match[1]);
    });

    for (const pid of pids) {
      console.log(`[SAFE-PORT] Killing PID ${pid} on port ${port}`);
      await execAsync(`taskkill //F //T //PID ${pid}`);
    }

    await new Promise(r => setTimeout(r, 2000));
    return true;
  } catch (e) {
    return false;
  }
}

function savePid(pid, port) {
  fs.writeFileSync(PID_FILE, JSON.stringify({ pid, port, time: Date.now() }));
}

function loadPid() {
  try {
    if (fs.existsSync(PID_FILE)) {
      return JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));
    }
  } catch (e) {}
  return null;
}

async function killSavedPid() {
  const saved = loadPid();
  if (saved) {
    try {
      await execAsync(`taskkill //F //T //PID ${saved.pid}`);
      fs.unlinkSync(PID_FILE);
      return true;
    } catch (e) {}
  }
  return false;
}

module.exports = { killPort, savePid, loadPid, killSavedPid };
```

### 6. Create WaveMenu (menu.js)

Create `scripts/menu.js`:

```javascript
#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Load config
const configPath = path.join(__dirname, '..', 'viz.config.json');
const config = fs.existsSync(configPath)
  ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
  : { name: 'VIZ Page', port: 9547, version: '1.0.0' };

const { killPort, savePid } = require('./safe-port.js');

const PORT = config.port;
const URL = `http://localhost:${PORT}`;
const NAME = config.name;

// Quick launch mode
const quickOption = process.argv[2];

async function executeOption(option) {
  switch(option) {
    case '1':
      console.log(`\n\x1b[36mOpening ${NAME}...\x1b[0m`);
      console.log(`URL: ${URL}\n`);
      const open = process.platform === 'win32' ? 'start' :
                   process.platform === 'darwin' ? 'open' : 'xdg-open';
      spawn(open, [URL], { shell: true });
      setTimeout(() => process.exit(0), 1000);
      break;

    case '2':
      console.log(`\n\x1b[33m[SAFE] Checking port ${PORT}...\x1b[0m`);
      await killPort(PORT);
      console.log(`\x1b[32mStarting dev server on port ${PORT}...\x1b[0m\n`);
      const devServer = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
      });
      savePid(devServer.pid, PORT);
      devServer.on('close', (code) => {
        console.log(`\nDev server exited with code ${code}`);
      });
      break;

    case '3':
      console.log(`\n\x1b[33m[SAFE] Stopping server on port ${PORT}...\x1b[0m`);
      await killPort(PORT);
      console.log(`\x1b[32mServer stopped.\x1b[0m\n`);
      setTimeout(() => process.exit(0), 1000);
      break;

    case '4':
      console.log('\n\x1b[33mBuilding for production...\x1b[0m\n');
      const build = spawn('npm', ['run', 'build'], {
        stdio: 'inherit',
        shell: true
      });
      build.on('close', (code) => {
        console.log(`\nBuild exited with code ${code}`);
        setTimeout(() => process.exit(0), 2000);
      });
      break;

    case '5':
      console.log(`\n\x1b[35m${NAME.toUpperCase()} INFO:\x1b[0m\n`);
      console.log(`  Name:       ${NAME}`);
      console.log(`  Port:       ${PORT}`);
      console.log(`  URL:        ${URL}`);
      console.log(`  Version:    ${config.version}`);
      console.log(`  Project:    ${config.project_id || 'unknown'}`);
      console.log(`  Framework:  Next.js 14 (App Router)`);
      console.log(`  Theme:      VUK (Solarized)`);
      console.log('\n\x1b[2mPress any key to exit...\x1b[0m');
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', () => process.exit(0));
      break;

    case '0':
      console.log('\n\x1b[2mGoodbye!\x1b[0m\n');
      process.exit(0);
      break;

    default:
      console.log('\n\x1b[31mInvalid option.\x1b[0m\n');
      process.exit(1);
  }
}

if (quickOption) {
  executeOption(quickOption);
} else {
  // Interactive mode
  console.clear();
  console.log('\n' + '='.repeat(50));
  console.log(`  ${NAME.toUpperCase()} - WAVE MENU`);
  console.log('='.repeat(50));
  console.log(`URL: \x1b[36m${URL}\x1b[0m\n`);

  console.log('1. Open in browser');
  console.log('2. Start dev server (safe restart)');
  console.log('3. Stop server');
  console.log('4. Build for production');
  console.log('5. Show info');
  console.log('0. Exit\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Select [0-5]: ', (answer) => {
    rl.close();
    executeOption(answer.trim());
  });

  rl.on('SIGINT', () => {
    console.log('\n');
    process.exit(0);
  });
}
```

### 7. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev -p 9556",
    "build": "next build",
    "start": "next start -p 9556",
    "menu": "node scripts/menu.js",
    "menu:open": "node scripts/menu.js 1",
    "menu:dev": "node scripts/menu.js 2",
    "menu:stop": "node scripts/menu.js 3"
  }
}
```

### 8. Copy FatCow Icons

```bash
# Create icons folder
mkdir -p public/icons

# Copy needed icons from FatCow
cp D:/02.Lab/_assets/png-icons/fatcow-master/32x32/application.png public/icons/
cp D:/02.Lab/_assets/png-icons/fatcow-master/32x32/wrench.png public/icons/
# ... add more as needed
```

### 9. Add .gitignore Entries

```
.server.pid
```

## Port Allocation

### Check Available Port

```bash
# Read port registry
cat W:/workprocess/_agent-orchestration/config/port-registry.json
```

### Register New Port

After setting up, add your port to the registry:

```json
// port-registry.json
{
  "allocated": {
    "9556": { "project": "my-project", "name": "My VIZ", "status": "active" }
  }
}
```

## VUK Color Reference

```css
/* Solarized Light Theme */
--page-bg: #fdf6e3;      /* Cream page background */
--card-bg: #eee8d5;      /* Card/panel background */
--border: #d3cbb7;       /* Borders */
--text-primary: #073642; /* Dark text */
--text-muted: #657b83;   /* Secondary text */
--text-subtle: #93a1a1;  /* Subtle text */

/* Accent Colors */
--blue: #268bd2;         /* Primary action */
--green: #859900;        /* Success */
--yellow: #b58900;       /* Warning */
--red: #dc322f;          /* Error/danger */
--cyan: #2aa198;         /* Info */
--magenta: #d33682;      /* Special */
```

## Icon Usage

```tsx
<img
  src="/icons/wrench.png"
  className="w-5 h-5"
  style={{ imageRendering: 'pixelated' }}
  alt="icon"
/>
```

**Important**: Always use `imageRendering: 'pixelated'` for FatCow icons!

## Template Location

Full starter template: `W:\workprocess\_agent-orchestration\templates\viz-starter\`

## Related

- **VUK Source**: `W:\code\vuk`
- **Safe Port Restart Skill**: `~/.claude/skills/safe-port-restart/`
- **Port Registry**: `W:\workprocess\_agent-orchestration\config\port-registry.json`
