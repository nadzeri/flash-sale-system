import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env, isProd } from '../../env.ts'
import { remember } from '@epic-web/remember'
import * as userSchema from './userSchema.ts'
import * as flashSaleSchema from './flashSaleSchema.ts'
import * as orderSchema from './orderSchema.ts'

const createPool = () => {
  return new Pool({
    connectionString: env.DATABASE_URL,
  })
}

let client

if (isProd()) {
  client = createPool()
} else {
  client = remember('dbPool', () => createPool())
}

export const db = drizzle({
  client,
  schema: {
    ...userSchema,
    ...flashSaleSchema,
    ...orderSchema,
  },
})
export default db
