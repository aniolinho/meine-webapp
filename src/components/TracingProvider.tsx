'use client'

import { useEffect, useState } from 'react'
import { init } from '@dash0/sdk-web'
import { logger } from '@/lib/logger'

export function TracingProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      logger.info({ component: 'TracingProvider' }, 'Initializing Dash0 Web SDK with service name: my-webapp-frontend')
      init({
        serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || 'my-webapp-frontend',
        endpoint: {
          url: process.env.NEXT_PUBLIC_OTEL_ENDPOINT || 'http://localhost:4318',
          authToken: process.env.NEXT_PUBLIC_OTEL_AUTH_TOKEN || '',
        },
      })
      logger.info({ component: 'TracingProvider' }, 'Dash0 Web SDK initialized')
      setInitialized(true)
    }
  }, [initialized])

  return <>{children}</>
}
