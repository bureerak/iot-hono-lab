import { Hono } from 'hono'
import students from './routes/student.js'

const app = new Hono()

app.route('/api/student', students)

export default app