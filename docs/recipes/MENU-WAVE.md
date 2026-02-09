# Menu Wave Recipe

> **ONE-STOP-SHOP for CLI dev menus - Gradients, Browser, Port Handling**

## Package Location

**GitHub:** `https://github.com/TheJesper/conzeon-toolkit/tree/main/packages/menu-wave`
**NPM:** `@thejesper/menu-wave`
**Version:** 1.3.0

---

## Quick Install

```bash
npm install @thejesper/menu-wave
```

Or link locally:
```bash
npm link D:\02.Lab\conzeon-toolkit\packages\menu-wave
```

---

## Core Utilities (ALWAYS USE THESE!)

### openBrowser - Cross-platform browser opening

```javascript
import { openBrowser } from '@thejesper/menu-wave';

// Works on Windows, Mac, Linux - never fails
await openBrowser('http://localhost:3000');
```

### killPort - Safe port conflict handling

```javascript
import { killPort, isPortInUse } from '@thejesper/menu-wave';

// Kill process using port 3000
await killPort(3000);

// Check if port is busy
if (await isPortInUse(3000)) {
  console.log('Port 3000 is in use!');
}
```

### createPidManager - Track server processes

```javascript
import { createPidManager } from '@thejesper/menu-wave';

const pid = createPidManager('./');

// Save PID when starting server
pid.save(process.pid, 3000);

// Kill saved process on restart
await pid.killSaved();
```

---

## Standard menu.js Pattern

```javascript
#!/usr/bin/env node
import { spawn } from 'child_process';
import { killPort, openBrowser, createPidManager } from '@thejesper/menu-wave';

const PORT = 3000;
const URL = `http://localhost:${PORT}`;
const pid = createPidManager('./');

const option = process.argv[2];

switch(option) {
  case '1':
    console.log('\n[SAFE] Starting dev server...\n');
    console.log('[Press Ctrl+C to stop]\n');

    await killPort(PORT);

    const server = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });
    pid.save(server.pid, PORT);

    // Open browser after 3s
    setTimeout(() => openBrowser(URL), 3000);

    server.on('close', (code) => process.exit(code));
    break;

  case '2':
    console.log('Building...');
    spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
    break;

  case '0':
    console.log('Goodbye!');
    process.exit(0);
    break;
}
```

### package.json scripts

```json
{
  "scripts": {
    "menu": "node scripts/menu.js",
    "menu:1": "node scripts/menu.js 1",
    "menu:2": "node scripts/menu.js 2",
    "menu:v": "node scripts/menu.js 1"
  }
}
```

---

## UI Components

MenuWave also provides beautiful CLI UI:

```javascript
import MenuWave, {
  colors,      // Color themes
  boxes,       // Box drawing
  logos,       // ASCII art logos
  menus,       // Interactive menus
  progress     // Spinners & progress bars
} from '@thejesper/menu-wave';

// Create themed menu app
const app = new MenuWave({
  theme: 'synthwave',  // rainbow, ocean, fire, purple, synthwave, solarized
  appName: 'My App',
  appVersion: '1.0.0'
});

// Show intro
await app.showIntro();

// Quick menu
const choice = await app.quickMenu('Options', [
  { title: 'Start Server', value: 'start' },
  { title: 'Build', value: 'build' },
  { title: 'Exit', value: 'exit' }
]);
```

---

## Safe Port Functions Reference

| Function | Description |
|----------|-------------|
| `killPort(port)` | Kill process on port (cross-platform) |
| `isPortInUse(port)` | Check if port is busy |
| `getPortPids(port)` | Get PIDs using port |
| `createPidManager(dir)` | Track server PIDs for clean shutdown |
| `openBrowser(url)` | Open URL in default browser |

---

## Examples in Production

| Project | Location | Notes |
|---------|----------|-------|
| Orchestrator VIZ | `web/orchestrator-viz/scripts/menu.js` | Full pattern |
| Covers | `scripts/menu.js` | Full pattern |

---

*Recipe: 2026-01-21*
*Package: @thejesper/menu-wave v1.3.0*
*GitHub: TheJesper/conzeon-toolkit*
