import { pgTable, varchar, uuid, index } from 'drizzle-orm/pg-core'
import { injectCreatedAtAndUpdatedAt } from './utils/index.ts'

export const usersTable = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    ...injectCreatedAtAndUpdatedAt(),
  },
  (table) => [index('users_email_index').on(table.email)]
)
