import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Runtime guard: prevent using SQLite in production (e.g. Vercel)
const databaseUrl = process.env.DATABASE_URL || ''
if (process.env.NODE_ENV === 'production') {
  if (!databaseUrl) {
    throw new Error(
      'Missing DATABASE_URL in production. Set a managed Postgres and configure DATABASE_URL in your hosting provider.'
    )
  }

  const isSqlite =
    databaseUrl.startsWith('file:') ||
    databaseUrl.startsWith('sqlite:') ||
    databaseUrl.endsWith('.db') ||
    databaseUrl.endsWith('.sqlite')

  if (isSqlite) {
    throw new Error(
      'SQLite detected in production (DATABASE_URL points to a file). Vercel does not provide persistent filesystem storage for SQLite. Use a managed Postgres (Vercel Postgres, Supabase, etc.) and update DATABASE_URL.'
    )
  }
}
