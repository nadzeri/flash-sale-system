import { eq, and, gt, sql } from 'drizzle-orm'
import { db } from '../db/connection.ts'
import { flashSalesTable } from '../db/flashSaleSchema.ts'
import { ordersTable } from '../db/orderSchema.ts'
import { flashSaleRepo } from '../repositories/flashSaleRepo.ts'
import { flashSaleService } from './flashSaleService.ts'

const purchaseOrder = async (flashSaleId: string, userId: string) => {
  const flashSale = await flashSaleRepo.getFlashSaleById(flashSaleId)

  if (!flashSale) {
    const error: any = new Error('Flash sale not found')
    error.status = 404
    throw error
  }

  const isActive = await flashSaleService.isFlashSaleActive(flashSale)
  if (!isActive) {
    const error: any = new Error('Flash sale is not active')
    error.status = 400
    throw error
  }

  const order = await db.transaction(async (tx) => {
    // Atomically decrement remaining stock only if > 0
    const decremented = await tx
      .update(flashSalesTable)
      .set({ remainingStock: sql`${flashSalesTable.remainingStock} - 1` })
      .where(
        and(
          eq(flashSalesTable.id, flashSaleId),
          gt(flashSalesTable.remainingStock, 0)
        )
      )
      .returning({ remainingStock: flashSalesTable.remainingStock })

    if (decremented.length === 0) {
      const error: any = new Error('Flash sale is out of stock')
      error.status = 400
      throw error
    }

    // Insert order, prevent duplicates per user and flash sale
    const [inserted] = await tx
      .insert(ordersTable)
      .values({ userId, flashSaleId })
      .onConflictDoNothing({
        target: [ordersTable.userId, ordersTable.flashSaleId],
      })
      .returning()

    if (!inserted) {
      // Revert stock decrement if user already purchased
      await tx
        .update(flashSalesTable)
        .set({ remainingStock: sql`${flashSalesTable.remainingStock} + 1` })
        .where(eq(flashSalesTable.id, flashSaleId))

      const error: any = new Error('Order already purchased')
      error.status = 400
      throw error
    }

    return inserted
  })

  return order
}

export const orderService = {
  purchaseOrder,
}
