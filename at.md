# Festsmeden - Current Tasks

## In Progress

- [ ] Decide on hosting + database solution

## Todo

- [ ] Deploy to Vercel (recommended)
- [ ] Set up database (Vercel KV, Supabase, or Firebase)
- [ ] Migrate from file-based storage to proper DB
- [ ] Add authentication (optional)

## Done

- [x] Project structure created
- [x] Added to orchestrator governance
- [x] Port 9558 allocated
- [x] Recipes copied
- [x] MVP extracted and running locally
- [x] Menu system configured

---

## MVP Status

**Running at:** http://localhost:9558

**Features:**
- User login (password-based, stored server-side)
- Voting polls for party activities
- Task assignment
- Vote logging/history
- Admin mode

**Current Storage:** File-based JSON (`/api/storage` endpoint)

---

## Hosting Options Analysis

| Option | Backend | Database | Free Tier | Verdict |
|--------|---------|----------|-----------|---------|
| GitHub Pages | ❌ | ❌ | ✅ | Won't work - no backend |
| **Vercel** | ✅ Serverless | Vercel KV/Postgres | ✅ | **Recommended** |
| Railway | ✅ | PostgreSQL | Limited | Good option |
| Render | ✅ | PostgreSQL | Limited | Good option |

**Recommendation:** Vercel + Vercel KV (Redis-like storage)
- Native Next.js support
- Free tier sufficient for small groups
- Easy migration from current file-based API

---

*Last updated: 2026-02-09*
