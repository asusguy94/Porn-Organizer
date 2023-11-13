import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : [] })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma as db }
