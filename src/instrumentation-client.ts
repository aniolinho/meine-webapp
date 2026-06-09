import { init, addSignalAttribute } from '@dash0/sdk-web'

init({
  serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || 'my-webapp-frontend',
  endpoint: {
    url: process.env.NEXT_PUBLIC_OTEL_ENDPOINT || 'http://localhost:4318',
    authToken: process.env.NEXT_PUBLIC_OTEL_AUTH_TOKEN || '',
  },
  propagateTraceHeadersCorsURLs: [/\/api\/.*/],
})

addSignalAttribute('app.version', '0.1.0')
addSignalAttribute('app.environment', process.env.NODE_ENV || 'development')

export { addSignalAttribute }
