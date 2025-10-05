import type { Request, Response } from 'express'
import type { JwtPayload } from '../utils/jwt.ts'
import { orderRepo } from '../repositories/orderRepo.ts'
import { orderService } from '../services/orderService.ts'

const getOrderDetails = async (
  req: Request & { user: JwtPayload },
  res: Response
) => {
  try {
    const { id: userId } = req.user
    const { flashSaleId } = req.params

    const order = await orderRepo.getOrderByUserIdAndFlashSaleId(
      userId,
      flashSaleId
    )

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.json({ order })
  } catch (error) {
    console.error('Order details error:', error)
    res.status(500).json({ error: 'Failed to get order details' })
  }
}

const purchaseOrder = async (
  req: Request & { user: JwtPayload },
  res: Response
) => {
  try {
    const { flashSaleId } = req.params
    const { id: userId } = req.user

    const order = await orderService.purchaseOrder(flashSaleId, userId)
    return res.json({ order })
  } catch (error) {
    const status = (error as any)?.status ?? 500
    const message = (error as any)?.message ?? 'Failed to purchase order'
    console.error('Purchase order error:', error)
    res.status(status).json({ error: message })
  }
}

export const orderController = {
  getOrderDetails,
  purchaseOrder,
}