/**
 * PostgreSQL connection pool — server-side only.
 *
 * Uses `pg` (node-postgres) directly — no ORM binary downloads needed.
 * Pool is created lazily on first use so the module can be imported during
 * `next build` without DATABASE_URL being present in the build environment.
 * In production (Coolify), DATABASE_URL is always set at runtime.
 *
 * DATABASE_URL format:
 *   postgresql://user:password@host:5432/dbname
 *   (set in Coolify → Environment Variables)
 *
 * NEVER import this file in Client Components — keep imports server-side.
 */

import { Pool, PoolClient } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
}

function getPool(): Pool {
  // Return cached pool across hot-reloads in dev
  if (globalThis.__pgPool) return globalThis.__pgPool

  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')

  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  })

  // Cache in dev so hot-reloads don't leak connections
  if (process.env.NODE_ENV !== 'production') globalThis.__pgPool = pool

  return pool
}

/**
 * Run a single parameterised query.
 * Pool is created on first call — safe to import during build.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const { rows } = await getPool().query(sql, params)
  return rows as T[]
}

/**
 * Run multiple queries in a single transaction.
 * Committed on resolve, rolled back on throw.
 */
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
