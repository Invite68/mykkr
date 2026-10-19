#!/usr/bin/env node
/**
 * Crawl every internal link starting from "/" and fail if any returns non-2xx/3xx,
 * or if the production CSP allows 'unsafe-eval'.
 *
 * Usage:  npm run build && npm start &   then   npm run check-links [-- http://localhost:3000]
 */
const base = process.argv[2] || 'http://localhost:3000'
const seen = new Set()
const queue = ['/']
const broken = []
let cspChecked = false

function extractLinks(html) {
  const out = []
  const re = /href="([^"]+)"/g
  let m
  while ((m = re.exec(html))) {
    const href = m[1].replace(/&amp;/g, '&')
    if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/_next/')) out.push(href.split('#')[0] || '/')
  }
  return out
}

while (queue.length) {
  const path = queue.shift()
  if (seen.has(path)) continue
  seen.add(path)
  let res
  try {
    res = await fetch(base + path, { redirect: 'follow' })
  } catch (err) {
    broken.push(`${path} → ${err.message}`)
    continue
  }
  if (!cspChecked) {
    const csp = res.headers.get('content-security-policy') || ''
    if (!csp) broken.push('No Content-Security-Policy header')
    if (csp.includes('unsafe-eval')) broken.push("CSP allows 'unsafe-eval' (run against `npm start`, not `npm run dev`)")
    cspChecked = true
  }
  if (!res.ok) {
    broken.push(`${path} → HTTP ${res.status}`)
    continue
  }
  if ((res.headers.get('content-type') || '').includes('text/html')) {
    for (const link of extractLinks(await res.text())) if (!seen.has(link)) queue.push(link)
  }
}

console.log(`Checked ${seen.size} internal URLs on ${base}`)
if (broken.length) {
  console.error('Problems:\n  ' + broken.join('\n  '))
  process.exit(1)
}
console.log('All links OK, CSP has no unsafe-eval ✓')
