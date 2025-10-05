import type { Request, Response } from 'express'
import type { JwtPayload } from '../utils/jwt.ts'
import { db } from '../db/connection.ts'
import { ordersTable } from '../db/orderSchema.ts'
import { and, eq, gte, lte } from 'drizzle-orm'
import { flashSalesTable } from '../db/flashSaleSchema.ts'

export const getOrderDetails = async (
  req: Request & { user: JwtPayload },
  res: Response
) => {
  try {
    const { id: userId } = req.user
    const { flashSaleId } = req.params

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.flashSaleId, flashSaleId), eq(ordersTable.userId, userId)))
      .limit(1)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.json({ order })
  } catch (error) {
    console.error('Order details error:', error)
    res.status(500).json({ error: 'Failed to get order details' })
  }
}

export const purchaseOrder = async (
  req: Request & { user: JwtPayload },
  res: Response
) => {
  try {
    const { flashSaleId } = req.params
    const { id: userId } = req.user
    const currentDate = new Date()

    // check if order is already purchased
    const [existingOrder] = await db
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.flashSaleId, flashSaleId),
          eq(ordersTable.userId, userId)
        )
      )
      .limit(1)

    if (existingOrder) {
      return res.status(400).json({ error: 'Order already purchased' })
    }

    // check if flash sale is active
    const [flashSale] = await db
      .select()
      .from(flashSalesTable)
      .where(
        and(
          eq(flashSalesTable.id, flashSaleId),
        )
      )
      .limit(1)

    if (!flashSale) {
      return res.status(404).json({ error: 'Flash sale not found' })
    }

    // check if flash sale has remaining stock

    if (flashSale.remainingStock <= 0) {
      return res.status(400).json({ error: 'Flash sale is out of stock' })
    }

    // create order
    const [order] = await db
      .insert(ordersTable)
      .values({ userId, flashSaleId })
      .returning()

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // update flash sale remaining stock
    await db
      .update(flashSalesTable)
      .set({ remainingStock: flashSale.remainingStock - 1 })
      .where(eq(flashSalesTable.id, flashSaleId))

    return res.json({ order })
  } catch (error) {
    console.error('Purchase order error:', error)
    res.status(500).json({ error: 'Failed to purchase order' })
  }
}
