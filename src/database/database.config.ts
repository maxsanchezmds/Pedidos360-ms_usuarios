import type { PoolConfig } from 'pg'

export function assertDatabaseConfigured() {
  if (!process.env.DATABASE_URL) {
    throw new Error('La variable DATABASE_URL no está configurada.')
  }
}

function sslConfig(): PoolConfig['ssl'] {
  if (process.env.DB_SSL !== 'true') return false

  const certificate = process.env.DB_SSL_CA?.replace(/\\n/g, '\n')
  return {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    ...(certificate ? { ca: certificate } : {}),
  }
}

export function databaseConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL

  return {
    ...(connectionString ? { connectionString } : {}),
    ssl: sslConfig(),
    max: 2,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    allowExitOnIdle: true,
  }
}
