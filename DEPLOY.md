# My KKR — Deployment Guide

> **v2 (Oct 2026):** the app is now a component-based Next.js App Router build — see README.md. `public/preview.html` and `src/app/route.ts` were removed; CSP is set in `next.config.js`. Health check: `/api/health`.


## Prerequisites
- Hostinger VPS KVM-1 (187.126.123.59)
- Coolify installed and running on :8000
- Domain mykkr.in with DNS pointing to VPS
- Cloudflare in front of VPS (recommended)

## Environment Variables (set in Coolify — never in code)

### Required before first deploy:
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://mykkr.in
NEXT_PUBLIC_API_URL=https://api.mykkr.in
```

### Required before backend launch:
```
DATABASE_URL=postgresql://...
JWT_SECRET=<openssl rand -base64 32>
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=<from Razorpay dashboard>
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_PRIVATE_KEY=...
TELEGRAM_BOT_TOKEN=...
ENCRYPTION_KEY=<openssl rand -base64 32>
```

## Security Checklist Before Going Live
- [ ] All env vars in Coolify (zero secrets in git)
- [ ] Cloudflare enabled with WAF + Bot Fight Mode
- [ ] UFW firewall configured (ports 22, 80, 443, 8000 only)
- [ ] Fail2Ban installed and running
- [ ] SSH key-only login (password auth disabled)
- [ ] PostgreSQL listening on localhost only (not 0.0.0.0)
- [ ] n8n accessible via SSH tunnel only (not public)
- [ ] Run: securityheaders.com → target grade A
- [ ] Run: ssllabs.com → target grade A
- [ ] Run: observatory.mozilla.org → target 70+

## Coolify Deploy Steps
1. Push to main branch → Coolify auto-deploys via webhook
2. Or: Coolify dashboard → app → Deploy (manual)

## Rollback
Coolify → app → Deployments → select previous → Redeploy
