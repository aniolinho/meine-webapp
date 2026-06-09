import pino from 'pino'
import { trace, context } from '@opentelemetry/api'

function getTraceContext(): Record<string, string> {
  const span = trace.getSpan(context.active())
  if (!span) return {}
  const ctx = span.spanContext()
  return { trace_id: ctx.traceId, span_id: ctx.spanId }
}

const _pino = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: process.env.OTEL_SERVICE_NAME || 'my-webapp',
  },
})

export const logger = {
  info:  (obj: object, msg?: string) => _pino.info({ ...getTraceContext(), ...obj }, msg),
  error: (obj: object, msg?: string) => _pino.error({ ...getTraceContext(), ...obj }, msg),
  warn:  (obj: object, msg?: string) => _pino.warn({ ...getTraceContext(), ...obj }, msg),
  debug: (obj: object, msg?: string) => _pino.debug({ ...getTraceContext(), ...obj }, msg),
  trace: (obj: object, msg?: string) => _pino.trace({ ...getTraceContext(), ...obj }, msg),
}

export const log = logger
