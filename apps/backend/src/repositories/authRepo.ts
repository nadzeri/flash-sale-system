import db from '../db/connection.ts'
import { usersTable } from '../db/userSchema.ts'
import type { NewUser } from '../types/userType.ts'
import { eq } from 'drizzle-orm'

const createUser = async (user: NewUser) => {
  const [newUser] = await db.insert(usersTable).values(user).returning()

  return newUser
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