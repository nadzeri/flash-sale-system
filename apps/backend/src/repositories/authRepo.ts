import db from '../db/connection.ts'
import { usersTable } from '../db/userSchema.ts'
import type { NewUser, User } from '@flash-sale/shared/types/userType.ts'
import { eq } from 'drizzle-orm'

const createUser = async (user: NewUser): Promise<User> => {
  const [newUser] = await db.insert(usersTable).values(user).returning()
  if (!newUser) {
    throw new Error('Failed to create user')
  }
  return newUser as User
}

const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))

  return user
}

export const authRepo = {
  createUser,
  getUserByEmail,
}
