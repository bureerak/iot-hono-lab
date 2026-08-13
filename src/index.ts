import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import students from './routes/student.js'

const apiToken = process.env.SECRET_PASSWORD

if (!apiToken) {
  throw new Error('SECRET_PASSWORD is not configured')
}

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))
app.use('/api/*', bearerAuth({ token: apiToken }))
app.route('/api/student', students)

const port = Number(process.env.PORT ?? 3000)

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be a valid TCP port')
}

const server = serve({
  fetch: app.fetch,
  port,
})

console.log(`Server listening on port ${port}`)

function shutdown() {
  server.close((error) => {
    if (error) {
      console.error('Failed to shut down cleanly', error)
      process.exit(1)
    }

    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

export default app
