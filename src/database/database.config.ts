import type { PoolConfig } from 'pg'

function requiredDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('La variable DATABASE_URL no está configurada.')
  return databaseUrl
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
  return {
    connectionString: requiredDatabaseUrl(),
    ssl: sslConfig(),
    max: 2,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    allowExitOnIdle: true,
  }
}

