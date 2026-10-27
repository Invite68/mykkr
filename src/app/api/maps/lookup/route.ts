/**
 * GET /api/maps/lookup?id=...
 *
 * Resolves a HERE place ID (from autocomplete) to full lat/lng + address.
 * API key NEVER leaves this file.
 */
import { NextRequest, NextResponse } from 'next/server'
import { lookupById } from '@/lib/here'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')?.trim()
  if (!id) {
    return NextResponse.json({ result: null, error: 'id required' }, { status: 400 })
  }

  try {
    const result = await lookupById(id)
    return NextResponse.json({ result })
  } catch (err) {
    console.error('[maps/lookup]', err)
    return NextResponse.json({ result: null, error: 'Lookup unavailable' }, { status: 503 })
  }
}
