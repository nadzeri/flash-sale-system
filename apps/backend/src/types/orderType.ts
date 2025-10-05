import { ordersTable } from "../db/orderSchema.ts"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertOrderSchema = createInsertSchema(ordersTable)
export const selectOrderSchema = createSelectSchema(ordersTable)

export type Order = z.infer<typeof insertOrderSchema>
export type NewOrder = z.infer<typeof insertOrderSchema>