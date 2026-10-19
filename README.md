# My KKR — Kurukshetra local marketplace

Next.js 16 (App Router) + React 19. Every screen is a real route built from React components — the old
single `public/preview.html` file (and the `route.ts` that served it) is gone.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run check-links  # crawl every internal link + confirm CSP has no 'unsafe-eval' (needs the server running)
```

## Where things live

| Path | What |
|---|---|
| `src/config/platform.ts` | **Monetization rules** — ₹99 business / ₹9.99 customer (+18% GST), 7-day trial, 0% commission, disclaimer |
| `src/config/roles.ts` | The 4 user roles |
| `src/data/categories.ts` | **Mandatory 7-group category hierarchy** |
| `src/config/nav.ts` | All navigation links (single source of truth) |
| `src/data/businesses.ts` | Demo listings — replace with API calls |
| `next.config.js` | CSP + security headers for every route, legacy redirects |
| `src/app/**/page.tsx` | Routes (below) |
| `src/components/**` | Layout shell, business cards, forms |

## Routes

`/` · `/categories` · `/c/[group]` · `/c/[group]/[sub]` · `/business/[slug]` · `/search?q=` · `/find-book` · `/rides` ·
`/post` · `/register?role=business|customer|driver` · `/dashboard` · `/dashboard/[role]` · `/pricing` · `/about` ·
`/privacy` · `/terms` · `/api/health`

Old links `/services`, `/shop`, `/food` and `/preview.html` redirect to the new pages.

## Why the buttons can't break under CSP any more

All interaction is React event handlers (`onClick={...}`) and `next/link`. Nothing is evaluated from strings, so the
production CSP (`script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com`, no `unsafe-eval`) never blocks
anything. `'unsafe-eval'` is added **only** for `next dev` (hot reload needs it). CI builds the app, crawls every link
and fails if a link 404s or the CSP gains `unsafe-eval`.

## Not wired yet (needs the NestJS backend)

Firebase phone OTP, Razorpay subscriptions, saving registrations / ride requests / requirements, real dashboards.
Each spot is marked `TODO(backend)` in the code. Forms validate fully and show confirmation screens today.
