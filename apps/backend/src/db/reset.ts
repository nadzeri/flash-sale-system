import { db } from './connection.ts'
import { usersTable } from './userSchema.ts'
import { flashSalesTable } from './flashSaleSchema.ts'
import { ordersTable } from './orderSchema.ts'
import { sql } from 'drizzle-orm'

async function teardown() {
  console.log('🌱 Starting database teardown...')

  try {
    // Clear existing data only if tables exist
    console.log('Clearing existing data...')

    await db.execute(sql`DROP TABLE IF EXISTS public.orders`)
    await db.execute(sql`DROP TABLE IF EXISTS public.flash_sales`)
    await db.execute(sql`DROP TABLE IF EXISTS public.users`)

    await db.execute(sql`DROP TABLE IF EXISTS drizzle."__drizzle_migrations"`)

    console.log('✅ Database teardown complete')
  } catch (error) {
    console.error('❌ Teardown failed:', error)
    throw error
  }
}

// Run teardown if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  teardown()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default teardown
