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
| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 + React 18 |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Port (dev) | 9558 |

---

## URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://festsmeden.vercel.app |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/hjfvoaeoabzlqymkwmxx |
| **Supabase API** | https://hjfvoaeoabzlqymkwmxx.supabase.co |
| **GitHub** | https://github.com/TheJesper/festsmeden |

---

## Supabase Configuration

| Setting | Value |
|---------|-------|
| Project ID | `hjfvoaeoabzlqymkwmxx` |
| Org | Conzeon AB |
| Schema | Multi-tenant with `project_id` |

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://hjfvoaeoabzlqymkwmxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Vz1MWk9_Xdz8qS2-uVE0iQ_CIOEUEal
```

### Multi-Tenant Architecture
This Supabase instance is **shared across multiple projects**. Each project uses a `project_id` to isolate its data.

```js
// In src/lib/supabase.js
const PROJECT_ID = 'festsmeden'

// All queries filter by project_id
await supabase.from('storage')
  .select('*')
  .eq('project_id', PROJECT_ID)
```

### Adding New Projects to Same Supabase
1. Copy `src/lib/supabase.js` to new project
2. Change `PROJECT_ID` constant
3. Use same env vars
4. Data is isolated by `project_id`

---

## Storage API

Key-value store in `src/lib/supabase.js`:

| Function | Description |
|----------|-------------|
| `getStorage(key, shared)` | Get value by key |
| `setStorage(key, value, shared)` | Set/update value |
| `deleteStorage(key, shared)` | Delete by key |
| `listStorage(prefix, shared)` | List keys with prefix |

### Database Schema
```sql
CREATE TABLE storage (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  shared BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Schema file: `supabase-schema.sql`

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
| `src/lib/supabase.js` | Supabase client + storage API |
| `supabase-schema.sql` | Database schema |
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

## Deployment

**Auto-deploys on push to `main` via Vercel.**

Manual deploy:
```bash
git add . && git commit -m "message" && git push
```

---

## Recipes

See `docs/recipes/` for:
- SAFE-PORT-RESTART.md - Port conflict resolution
- MENU-WAVE.md - Interactive CLI menu
- HEALTH-ENDPOINT.md - Health check setup

---

*Created: 2026-02-09*
*Updated: 2026-02-10 (Supabase + Vercel setup)*
*Managed by: Agent Orchestrator*
