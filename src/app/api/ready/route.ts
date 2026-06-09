import { NextResponse } from 'next/server'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const span = trace.getActiveSpan()
  span?.setAttribute('http.route', '/api/ready')

  const start = Date.now()

  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$queryRaw`SELECT 1`

    const durationMs = Date.now() - start
    logger.info({ route: '/api/ready', durationMs }, 'Readiness check passed')

    return NextResponse.json({ status: 'ready', database: 'connected' }, { status: 200 })
  } catch (error) {
    const durationMs = Date.now() - start
    span?.setStatus({ code: SpanStatusCode.ERROR, message: `${(error as Error).name}: ${(error as Error).message}` })
    logger.error({
      route: '/api/ready',
      durationMs,
      'exception.type': (error as Error).name,
      'exception.message': (error as Error).message,
      'exception.stacktrace': (error as Error).stack,
    }, 'Readiness check failed')

    return NextResponse.json({
      status: 'not ready',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}
