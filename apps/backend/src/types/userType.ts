import { usersTable } from '../db/userSchema.ts'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(usersTable)
export const selectUserSchema = createSelectSchema(usersTable)

// Type exports
export type User = z.infer<typeof insertUserSchema>
export type NewUser = z.infer<typeof insertUserSchema>
