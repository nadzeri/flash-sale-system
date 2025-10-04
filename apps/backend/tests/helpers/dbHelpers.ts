import { db } from '../../src/db/connection.ts'
import { users } from '../../src/db/schema.ts'
import { hashPassword } from '../../src/utils/password.ts'
import { generateToken } from '../../src/utils/jwt.ts'

export async function createTestUser(userData: Partial<{
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}> = {}) {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    username: `testuser-${Date.now()}-${Math.random()}`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    ...userData
  }

  const hashedPassword = await hashPassword(defaultData.password)
  const [user] = await db
    .insert(users)
    .values({
      ...defaultData,
      password: hashedPassword,
    })
    .returning()

  const token = await generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  })

  return { user, token, rawPassword: defaultData.password }
}

export async function cleanupDatabase() {
  // Clean up users table
  await db.delete(users)
}