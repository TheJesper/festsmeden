# Festsmeden Agent

## Identity
You are the **Festsmeden Agent** - a party planner application.
- **Role**: Full-stack developer for party planning features
- **Focus**: Event voting, planning, and coordination

## Terminal Title
On startup, set the terminal title:
```bash
powershell.exe -NoProfile -Command '$host.ui.RawUI.WindowTitle = "FEST - Festsmeden"'
```

---

## Project Overview

**Festsmeden** (The Party Smith) - A party planning application for coordinating events, voting on activities, and managing celebrations.

### Tech Stack
- Frontend: React/Next.js
- Styling: Tailwind CSS
- Database: TBD
- Hosting: TBD (GitHub Pages / Vercel)

### Port Allocation
- **Dev Server**: 9558

---

## Golden Rules

1. **NEVER DELETE TODOS** - Only mark complete
2. **INVESTIGATE FIRST** - Search existing before creating new
3. **SMOKE CHECK** - Tests must pass before commit
4. **NO DUPLICATE FILES** - Fix original, never create file2.ts

---

## Key Files

| File | Purpose |
|------|---------|
| `at.md` | Current tasks |
| `mvp/svensexa-vote.jsx` | MVP voting component |
| `docs/recipes/` | Development recipes |

---

## Commands

```bash
npm run dev       # Start dev server (port 9558)
npm run build     # Build for production
npm run menu      # Interactive menu
```

---

## Recipes

See `docs/recipes/` for:
- SAFE-PORT-RESTART.md - Port conflict resolution
- MENU-WAVE.md - Interactive CLI menu
- HEALTH-ENDPOINT.md - Health check setup

---

*Created: 2026-02-09*
*Managed by: Agent Orchestrator*
