import { eq } from 'drizzle-orm'
import { db } from '../db/connection.ts'
import { flashSalesTable } from '../db/flashSaleSchema.ts'
import { ordersTable } from '../db/orderSchema.ts'
import { orderRepo } from '../repositories/orderRepo.ts'
import { flashSaleRepo } from '../repositories/flashSaleRepo.ts'

const purchaseOrder = async (flashSaleId: string, userId: string) => {
  const existingOrder = await orderRepo.getOrderByUserIdAndFlashSaleId(
    userId,
    flashSaleId
  )

  if (existingOrder) {
    const error: any = new Error('Order already purchased')
    error.status = 400
    throw error
  }

  const flashSale = await flashSaleRepo.getFlashSaleById(flashSaleId)

  console.log(flashSale, 'flashSale', flashSaleId)

  if (!flashSale) {
    const error: any = new Error('Flash sale not found')
    error.status = 404
    throw error
  }

  if (flashSale.remainingStock <= 0) {
    const error: any = new Error('Flash sale is out of stock')
    error.status = 400
    throw error
  }

  const order = await db.transaction(async (tx) => {
    const [newOrder] = await tx
      .insert(ordersTable)
      .values({
        userId,
        flashSaleId,
      })
      .returning()

    const flashSale = await flashSaleRepo.getFlashSaleById(flashSaleId)

    await tx
      .update(flashSalesTable)
      .set({ remainingStock: flashSale.remainingStock - 1 })
      .where(eq(flashSalesTable.id, flashSaleId))

    return newOrder
  })

  return order
}

export const orderService = {
  purchaseOrder,
}
