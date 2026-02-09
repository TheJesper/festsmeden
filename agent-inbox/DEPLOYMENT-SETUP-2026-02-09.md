# Task: Deploy Festsmeden

**Priority:** Low
**Type:** Task
**From:** Orchestrator

---

## Context

New party planner project needs hosting and GitHub setup.

## Free Hosting Options

| Option | Pros | Cons |
|--------|------|------|
| **GitHub Pages** | Free, simple | Static only, no backend |
| **Vercel** | Free tier, Next.js native | 100GB bandwidth limit |
| **Netlify** | Free tier, good DX | 100GB bandwidth limit |
| **Proxmox** | Full control, custom domain | Self-managed |

## Recommended: Vercel (for MVP)

Since the MVP is React/Next.js, Vercel is the easiest:

1. Create GitHub repo: `TheJesper/festsmeden`
2. Push code to GitHub
3. Connect Vercel to repo (auto-deploy)
4. Optional: Custom domain `festsmeden.conzeon.dev`

## Tasks

- [ ] Create GitHub repo
- [ ] Push initial code
- [ ] Connect to Vercel
- [ ] Configure domain (optional)
- [ ] Set up database for persistence (later)

## GitHub Setup Commands

```bash
cd W:/code/festsmeden
git remote add origin https://github.com/TheJesper/festsmeden.git
git branch -M main
git push -u origin main
```

---

*Created: 2026-02-09*
*Source: Orchestrator*
