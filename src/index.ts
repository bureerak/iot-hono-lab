import 'dotenv/config'
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

export default app
