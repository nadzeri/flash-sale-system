import { db } from '../../src/db/connection.ts'
import { usersTable } from '../../src/db/userSchema.ts'
import { flashSalesTable } from '../../src/db/flashSaleSchema.ts'
import { ordersTable } from '../../src/db/orderSchema.ts'
import { hashPassword } from '../../src/utils/password.ts'
import { generateToken } from '../../src/utils/jwt.ts'

export async function createTestUser(
  userData: Partial<{
    email: string
    password: string
  }> = {}
) {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    password: 'TestPassword123!',
    ...userData,
  }

  const hashedPassword = await hashPassword(defaultData.password)
  const [user] = await db
    .insert(usersTable)
    .values({
      ...defaultData,
      password: hashedPassword,
    })
    .returning()

  const token = await generateToken({
    id: user.id,
    email: user.email,
  })

  return { user, token, rawPassword: defaultData.password }
}

export async function cleanupDatabase() {
  // Order of deletion matters due to FKs
  await db.delete(ordersTable)
  await db.delete(flashSalesTable)
  await db.delete(usersTable)
}

export async function createTestFlashSale(
  overrides: Partial<{
    startDate: Date
    endDate: Date
    totalStock: number
    remainingStock: number
  }> = {}
) {
  const now = new Date()
  const defaultStart = new Date(now.getTime() - 60_000) // started 1m ago
  const defaultEnd = new Date(now.getTime() + 60 * 60_000) // ends in 1h

  const data = {
    startDate: overrides.startDate ?? defaultStart,
    endDate: overrides.endDate ?? defaultEnd,
    totalStock: overrides.totalStock ?? 5,
    remainingStock: overrides.remainingStock ?? overrides.totalStock ?? 5,
  }

  const [flashSale] = await db.insert(flashSalesTable).values(data).returning()

  return flashSale
}
