import type { NewUser } from '@flash-sale/shared/types/userType.ts'
import bcrypt from 'bcrypt'
import { authRepo } from '../repositories/authRepo.ts'

const register = async (email: string, password: string) => {
  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  const user: NewUser = {
    email,
    password: hashedPassword,
  }

  const newUser = await authRepo.createUser(user)

  return newUser
}

const findUser = async (email: string, password: string) => {
  const user = await authRepo.getUserByEmail(email)
  if (!user) {
    return null
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    return null
  }

  return user
}

export const authService = {
  register,
  findUser,
}
