import { db } from './connection.ts'
import { usersTable } from './userSchema.ts'
import { flashSalesTable } from './flashSaleSchema.ts'
import { ordersTable } from './orderSchema.ts'

async function teardown() {
  console.log('🌱 Starting database teardown...')

  try {
    // Clear existing data
    console.log('Clearing existing data...')
    // Delete child table first to avoid FK violations
    await db.delete(ordersTable)
    await db.delete(flashSalesTable)
    await db.delete(usersTable)

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
