import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { getEnv } from '../env.js'

const connectionString = getEnv('DATABASE_URL')

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

const sql = neon(connectionString)
const db = drizzle({ client: sql })

export default db
