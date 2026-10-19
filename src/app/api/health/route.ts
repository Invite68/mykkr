import { NextResponse } from 'next/server'

/** Lightweight health check for Coolify / Docker HEALTHCHECK */
export function GET() {
  return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
}
