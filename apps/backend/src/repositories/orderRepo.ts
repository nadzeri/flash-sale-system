import { ordersTable } from '../db/orderSchema.ts'
import { and, eq } from 'drizzle-orm'
import db from '../db/connection.ts'

const getOrderByFlashSaleId = async (flashSaleId: string) => {
  const order = await db.query.ordersTable.findFirst({
    where: eq(ordersTable.flashSaleId, flashSaleId),
  })

  return order
}

const getOrderByUserIdAndFlashSaleId = async (
  userId: string,
  flashSaleId: string
) => {
  const order = await db.query.ordersTable.findFirst({
    where: and(
      eq(ordersTable.userId, userId),
      eq(ordersTable.flashSaleId, flashSaleId)
    ),
  })

  return order
}

export const orderRepo = {
  getOrderByFlashSaleId,
  getOrderByUserIdAndFlashSaleId,
}