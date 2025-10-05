import { db } from '../../src/db/connection.ts'
import { usersTable } from '../../src/db/userSchema.ts'
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
  // Clean up users table
  await db.delete(usersTable)
}
