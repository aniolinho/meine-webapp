import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs'
import { logs } from '@opentelemetry/api-logs'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'
    const OTEL_AUTH_TOKEN = process.env.OTEL_AUTH_TOKEN

    console.log('[OTel] Endpoint:', OTEL_ENDPOINT)
    console.log('[OTel] Auth:', OTEL_AUTH_TOKEN ? 'configured' : 'missing')

    const exporterHeaders: Record<string, string> = {}
    if (OTEL_AUTH_TOKEN) {
      exporterHeaders['Authorization'] = `Bearer ${OTEL_AUTH_TOKEN}`
    }

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'my-webapp',
      [ATTR_SERVICE_VERSION]: '0.1.0',
      'deployment.environment.name': process.env.NODE_ENV || 'development',
    })

    const loggerProvider = new LoggerProvider({
      resource,
      processors: [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: `${OTEL_ENDPOINT}/v1/logs`,
            headers: exporterHeaders,
          }),
        ),
      ],
    })
    logs.setGlobalLoggerProvider(loggerProvider)

    const sdk = new NodeSDK({
      resource,
      traceExporter: new OTLPTraceExporter({
        url: `${OTEL_ENDPOINT}/v1/traces`,
        headers: exporterHeaders,
      }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${OTEL_ENDPOINT}/v1/metrics`,
          headers: exporterHeaders,
        }),
        exportIntervalMillis: 10000,
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
          '@opentelemetry/instrumentation-dns': { enabled: false },
        }),
      ],
    })

    sdk.start()

    async function shutdown() {
      await loggerProvider.forceFlush()
      await Promise.allSettled([sdk.shutdown(), loggerProvider.shutdown()])
    }

    function logExceptionAndExit(message: string, error: Error, exitCode: number) {
      logs.getLogger('shutdown').emit({
        severityNumber: 17, // ERROR
        severityText: 'ERROR',
        body: message,
        attributes: {
          'exception.type': error.name,
          'exception.message': error.message,
          'exception.stacktrace': error.stack,
        },
      })
      shutdown().finally(() => process.exit(exitCode))
    }

    process.on('SIGTERM', () => shutdown().finally(() => process.exit(0)))
    process.on('SIGINT', () => shutdown().finally(() => process.exit(0)))
    process.on('uncaughtException', (error) => {
      logExceptionAndExit('uncaught.exception', error, 1)
    })
    process.on('unhandledRejection', (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason))
      logExceptionAndExit('unhandled.rejection', error, 1)
    })
  }
}
