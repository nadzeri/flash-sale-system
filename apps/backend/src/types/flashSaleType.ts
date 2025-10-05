import { flashSalesTable } from "../db/flashSaleSchema.ts"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertFlashSaleSchema = createInsertSchema(flashSalesTable)
export const selectFlashSaleSchema = createSelectSchema(flashSalesTable)

export type FlashSale = z.infer<typeof selectFlashSaleSchema>
export type NewFlashSale = Pick<
  FlashSale,
  'startDate' | 'endDate' | 'totalStock' | 'remainingStock'
>

export type FlashSaleStatus = 'active' | 'upcoming' | 'ended'
export type FlashSaleStatusResponse = {
  flashSale: FlashSale
  status: FlashSaleStatus
}