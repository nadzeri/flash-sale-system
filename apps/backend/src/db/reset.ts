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

    // Check if tables exist and delete only if they do
    const tableExists = async (tableName: string) => {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        );
      `)
      return result.rows[0]?.exists || false
    }

    // Delete child table first to avoid FK violations
    if (await tableExists('orders')) {
      await db.delete(ordersTable)
    }
    if (await tableExists('flash_sales')) {
      await db.delete(flashSalesTable)
    }
    if (await tableExists('users')) {
      await db.delete(usersTable)
    }

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
