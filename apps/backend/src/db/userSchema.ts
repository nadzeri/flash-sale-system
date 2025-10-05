import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core'
import { injectCreatedAtAndUpdatedAt } from './utils/index.ts'

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  ...injectCreatedAtAndUpdatedAt(),
})
