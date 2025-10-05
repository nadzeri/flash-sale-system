import { flashSalesTable } from "../db/flashSaleSchema.ts"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertFlashSaleSchema = createInsertSchema(flashSalesTable)
export const selectFlashSaleSchema = createSelectSchema(flashSalesTable)

export type FlashSale = z.infer<typeof insertFlashSaleSchema>
export type NewFlashSale = z.infer<typeof insertFlashSaleSchema>