import 'dotenv/config'
import dns from 'node:dns'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'

dns.setDefaultResultOrder?.('ipv4first')

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  }),
})

export const db = new Kysely<Database>({
  dialect,
})
