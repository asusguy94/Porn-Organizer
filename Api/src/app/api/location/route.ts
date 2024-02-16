import { NextResponse } from 'next/server'

import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await db.location.findMany())
}
