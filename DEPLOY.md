# My KKR — Complete Deployment Guide (Coolify on Hostinger VPS)

## What you get after this guide
- mykkr.in live on the internet
- Auto-SSL certificate (HTTPS)
- Auto-deploy on every code change
- Everything running for ₹299–400/month total

---

## Step 1 — Get your VPS (10 minutes)

1. Go to **hostinger.com/vps-hosting**
2. Choose **KVM 1** plan — ₹299/month (1 vCPU, 4GB RAM, 40GB SSD)
3. Select location: **Singapore** (fastest for India)
4. Select OS: **Ubuntu 22.04 LTS**
5. Set a root password — write it in your Notes app
6. Complete payment
7. Wait 2–3 minutes → you receive an email with your **server IP address**

---

## Step 2 — Connect to your server (5 minutes)

### On iPhone (no laptop needed):
1. Download **SSH Files — Secure ShellFish** from App Store (free)
2. Open it → New Server
3. Enter:
   - Hostname: `[your server IP]`
   - Username: `root`
   - Password: `[your VPS password]`
4. Connect → you see a black terminal screen

### On laptop (Windows):
1. Download PuTTY from putty.org
2. Host: `[your server IP]` | Port: 22
3. Login: `root` | Password: `[your VPS password]`

---

## Step 3 — Install Coolify (5 minutes, copy-paste exactly)

In your terminal, paste this one command:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Wait 3–5 minutes. When it finishes, you see:
```
Coolify is ready to use!
Open: http://[your-ip]:8000
```

Open that URL in your phone/browser. Create your admin account.

---

## Step 4 — Connect your domain (10 minutes)

### In your domain registrar (GoDaddy):
1. Log in → My Products → mykkr.in → DNS
2. Add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | [your server IP] | 600 |
| A | www | [your server IP] | 600 |

Wait 5–30 minutes for DNS to propagate.

### In Coolify:
1. Settings → Domains → Add Domain
2. Enter: `mykkr.in` and `www.mykkr.in`
3. Coolify automatically gets SSL certificate → your site runs on HTTPS

---

## Step 5 — Push code to GitHub (5 minutes)

1. Go to **github.com** → Create free account
2. Create new repository: `mykkr-app` (private)
3. On your laptop, in the project folder:

```bash
git init
git add .
git commit -m "Initial My KKR commit"
git branch -M main
git remote add origin https://github.com/[yourusername]/mykkr-app.git
git push -u origin main
```

---

## Step 6 — Deploy in Coolify (10 minutes)

1. Coolify dashboard → **New Project** → **New Application**
2. Select **GitHub** → Connect your GitHub account → Select `mykkr-app` repo
3. Configuration:
   - Branch: `main`
   - Build Pack: **Dockerfile** (auto-detected)
   - Port: `3000`
   - Domain: `mykkr.in`
4. Add environment variables (click Environment Variables):
   ```
   NEXT_PUBLIC_API_URL=https://api.mykkr.in
   NEXT_PUBLIC_FIREBASE_API_KEY=[your Firebase key]
   NEXT_PUBLIC_RAZORPAY_KEY=[your Razorpay test key]
   NODE_ENV=production
   ```
5. Click **Deploy** → Watch the build logs
6. Build takes 3–5 minutes → site goes live at mykkr.in

---

## Step 7 — Auto-deploy setup (2 minutes)

In Coolify → your app → Webhooks → Copy the webhook URL

In GitHub → your repo → Settings → Webhooks → Add webhook:
- Payload URL: paste Coolify webhook URL
- Events: select "Push events"

Now every time you make a change and push to GitHub, Coolify automatically rebuilds and deploys. Zero manual work.

---

## Monthly cost breakdown

| Service | Cost |
|---------|------|
| Hostinger KVM 1 VPS | ₹299/month |
| Coolify | FREE (self-hosted) |
| SSL certificate | FREE (Let's Encrypt via Coolify) |
| GitHub | FREE |
| Domain mykkr.in | ₹58/month (₹700/year) |
| **Total** | **₹357/month** |

You break even with **2 paying businesses** (₹299 × 2 = ₹598 > ₹357).

---

## What else runs on this same VPS

Because you have a full server, you can run everything on it:
- My KKR Next.js website (Port 3000)
- Your backend API when ready (Port 3001)
- n8n automation (Port 5678)
- PostgreSQL database (Port 5432)
- Redis cache (Port 6379)

All managed through Coolify's dashboard. One server. One monthly cost. Everything.

---

## Troubleshooting

**Site not loading after deploy:**
- Check Coolify logs → Application → Logs
- Most common issue: environment variable missing

**Build fails:**
- Check if `npm run build` works locally first
- Check Node.js version matches (must be 20+)

**SSL not working:**
- Wait 10 minutes for DNS propagation
- In Coolify → Domains → Force SSL renewal

**Need help:**
- Paste the error message to Claude with "My KKR Coolify error:"
- You'll get the exact fix in seconds
