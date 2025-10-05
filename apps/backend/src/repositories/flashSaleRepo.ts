import db from '../db/connection.ts'
import { flashSalesTable } from '../db/flashSaleSchema.ts'
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm'
import type { NewFlashSale } from '../types/flashSaleType.ts'

const getCurrentFlashSale = async () => {
  const currentDate = new Date()

  const flashSale = await db.query.flashSalesTable.findFirst({
    where: and(
      lte(flashSalesTable.startDate, currentDate),
      gte(flashSalesTable.endDate, currentDate)
    ),
  })

  return flashSale
}

const getNextFlashSale = async () => {
  const currentDate = new Date()

  const flashSale = await db.query.flashSalesTable.findFirst({
    where: gte(flashSalesTable.startDate, currentDate),
    orderBy: asc(flashSalesTable.startDate),
  })

  return flashSale
}

const getPreviousFlashSale = async () => {
  const currentDate = new Date()

  const flashSale = await db.query.flashSalesTable.findFirst({
    where: lte(flashSalesTable.endDate, currentDate),
    orderBy: desc(flashSalesTable.endDate),
  })

  return flashSale
}

const getOverlappingFlashSale = async (startDate: Date, endDate: Date) => {
  const flashSale = await db.query.flashSalesTable.findFirst({
    where: and(
      lte(flashSalesTable.startDate, endDate),
      gte(flashSalesTable.endDate, startDate)
    ),
  })

  return flashSale
}

const createFlashSale = async (flashSale: NewFlashSale) => {
  const [newFlashSale] = await db
    .insert(flashSalesTable)
    .values(flashSale)
    .returning()

  return newFlashSale
}

const getFlashSaleById = async (flashSaleId: string) => {
  const flashSale = await db.query.flashSalesTable.findFirst({
    where: eq(flashSalesTable.id, flashSaleId),
  })

  return flashSale
}

const decreaseRemainingStock = async (flashSaleId: string) => {
  const flashSale = await getFlashSaleById(flashSaleId)

  const [updatedFlashSale] = await db
    .update(flashSalesTable)
    .set({ remainingStock: flashSale.remainingStock - 1 })
    .where(eq(flashSalesTable.id, flashSaleId))
    .returning()

  return updatedFlashSale
}

export const flashSaleRepo = {
  getCurrentFlashSale,
  getNextFlashSale,
  getPreviousFlashSale,
  getOverlappingFlashSale,
  createFlashSale,
  getFlashSaleById,
  decreaseRemainingStock,
}
