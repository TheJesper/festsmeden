# Domain Setup Recipe

> **For:** Projects requiring domain/subdomain access
> **Dependencies:** DNSify (`W:/code/dnsify/loopia-ddns`)
> **Infrastructure:** Proxmox workspace (`W:/workspaces/proxmox`)

## When to Use

- Project needs a public URL (e.g., `myapp.conzeon.dev`)
- Project needs authentication-protected access
- Project needs local-only domain for personal use
- Project needs SSL certificates

## Quick Setup

### Step 1: Register via DNSify Menu

```bash
cd W:/code/dnsify/loopia-ddns
npm run menu
# Select: 🌐 Domain Management → ➕ Add New Domain
```

### Step 2: Or Add to unified.json Directly

Add subdomain entry to `W:/code/dnsify/loopia-ddns/config/unified.json`:

```json
{
  "domains": {
    "subdomains": {
      "myapp.conzeon.dev": {
        "enabled": true,
        "hosting": "home",
        "ip": "dynamic",
        "authentication": "public",
        "services": ["my-app"],
        "ssl": {
          "enabled": true,
          "provider": "letsencrypt"
        },
        "deployment": {
          "docker_service": "my-app"
        }
      }
    }
  }
}
```

### Step 3: Update DNS

```bash
npm run update  # Push DNS changes to Loopia
```

### Step 3: Add Traefik Labels (if Docker)

```yaml
services:
  myapp:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.myapp.rule=Host(`myapp.conzeon.dev`)"
      - "traefik.http.routers.myapp.tls=true"
      - "traefik.http.routers.myapp.tls.certresolver=letsencrypt"
      - "traefik.http.services.myapp.loadbalancer.server.port=3000"
```

## Domain Config Templates

### Public App (No Auth)
```json
{
  "domain": "app.conzeon.dev",
  "access": "public",
  "auth": "none",
  "ssl": true,
  "port": 3000
}
```

### Private Admin Panel (Basic Auth)
```json
{
  "domain": "admin.conzeon.dev",
  "access": "private",
  "auth": "basic",
  "authUsers": ["admin", "jesper"],
  "ssl": true,
  "port": 8080
}
```

### Personal/Private Service (Local Only)
```json
{
  "domain": "ideas.local",
  "type": "local",
  "access": "internal",
  "auth": "none",
  "ssl": false,
  "port": 4000,
  "localOnly": true,
  "description": "Only accessible from home network"
}
```

### SSO Protected Service
```json
{
  "domain": "dashboard.conzeon.dev",
  "access": "private",
  "auth": "sso",
  "ssoProvider": "authentik",
  "allowedGroups": ["admins"],
  "ssl": true,
  "port": 5000
}
```

## Available Domains

DNSify manages these base domains:
- `conzeon.dev` - Primary development domain
- `conzeon.com` - Production/commercial
- `conzeo.se` - Swedish locale
- `nntt.me` - Short URLs / personal
- Custom local domains (*.local)

## Authentication Options

| Auth Type | Use Case | Setup |
|-----------|----------|-------|
| `none` | Public apps | No config needed |
| `basic` | Simple protection | Add users to config |
| `oauth` | Google/GitHub login | Configure OAuth app |
| `sso` | Enterprise/multi-app | Authentik integration |

## Verification

After setup, verify:

```bash
# Check DNS propagation
nslookup myapp.conzeon.dev

# Test HTTPS
curl -I https://myapp.conzeon.dev

# Test from local network
curl -I http://192.168.1.57:3000
```

## Troubleshooting

### DNS not resolving
- Wait 5-10 minutes for propagation
- Run `npm run update-dns` in dnsify
- Check Loopia DNS panel manually

### SSL certificate error
- Ensure port 80/443 are open
- Check Traefik logs: `docker logs traefik`
- Verify DNS points to correct IP

### Auth not working
- Regenerate password hash: `htpasswd -nb user pass`
- Update docker-compose and restart
- Check Traefik middleware config

## Files Reference

| File | Purpose |
|------|---------|
| `domain.config.json` | Project domain configuration |
| `W:/code/dnsify/loopia-ddns/.env` | DNS API credentials |
| `W:/workspaces/proxmox/docker-compose.yml` | Traefik + services |
| `W:/workspaces/proxmox/config/traefik/dynamic.yml` | Traefik middlewares |
