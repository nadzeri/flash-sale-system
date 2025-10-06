// Type exports
export type User = {
  id: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}
export type NewUser = Pick<User, 'email' | 'password'>
