# Health Endpoint Recipe

Standard health endpoint pattern for all Conzeon apps.

## Response Format

```json
GET /api/health
{
  "status": "ok",
  "app": "app-name",
  "version": "a1b2c3d",
  "build": "2026-01-04T12:00:00Z",
  "timestamp": "2026-01-04T12:05:00Z"
}
```

Optional fields:
- `database`: "postgresql" | "mongodb" | "sqlite"
- `uptime`: seconds since start

---

## Next.js Implementation

### 1. Create Route

```typescript
// app/api/health/route.ts
export const dynamic = 'force-dynamic';

const startTime = Date.now();

export async function GET() {
  return Response.json({
    status: 'ok',
    app: process.env.APP_NAME || 'unknown',
    version: process.env.GIT_SHA || 'local',
    build: process.env.BUILD_TIME || new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString()
  });
}
```

### 2. Set Environment Variables in CD Pipeline

**GitHub Actions example:**

```yaml
- name: Build with version info
  run: |
    export GIT_SHA=$(git rev-parse --short HEAD)
    export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    docker build \
      --build-arg GIT_SHA=$GIT_SHA \
      --build-arg BUILD_TIME=$BUILD_TIME \
      -t myapp .
```

**Dockerfile:**

```dockerfile
ARG GIT_SHA=local
ARG BUILD_TIME=unknown

ENV GIT_SHA=$GIT_SHA
ENV BUILD_TIME=$BUILD_TIME
```

---

## Express/Node.js Implementation

```javascript
// routes/health.js
const startTime = Date.now();

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: process.env.APP_NAME || 'unknown',
    version: process.env.GIT_SHA || 'local',
    build: process.env.BUILD_TIME || new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString()
  });
});
```

---

## DNSify/Traefik Bypass

Health endpoints should be PUBLIC (no SSO). Add bypass in DNSify config:

```yaml
# In traefik labels or dynamic config
- "traefik.http.routers.myapp-health.rule=Host(`myapp.conzeon.dev`) && PathPrefix(`/api/health`)"
- "traefik.http.routers.myapp-health.middlewares="  # No auth middleware!
- "traefik.http.routers.myapp-health.priority=100"  # Higher priority than SSO route
```

Or in DNSify services.yml:

```yaml
myapp:
  domain: myapp.conzeon.dev
  auth: sso
  public_paths:
    - /api/health
```

---

## Database Health Check (Optional)

```typescript
// With database check
import { db } from '@/lib/db';

export async function GET() {
  let dbStatus = 'unknown';

  try {
    await db.query('SELECT 1');
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  return Response.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    app: process.env.APP_NAME || 'unknown',
    version: process.env.GIT_SHA || 'local',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
}
```

---

## Verification

```bash
# Check health
curl https://myapp.conzeon.dev/api/health

# Expected: {"status":"ok","version":"a1b2c3d",...}
# If returns HTML login page: bypass not configured
# If version is "local": GIT_SHA not set in build
```

---

## Checklist

- [ ] Create `/api/health` route
- [ ] Set `GIT_SHA` in CD pipeline build args
- [ ] Set `BUILD_TIME` in CD pipeline
- [ ] Add Traefik bypass for `/api/health` path
- [ ] Verify endpoint returns JSON (not login page)
- [ ] Verify version shows git commit (not "local")
