import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { orderRepo } from '../repositories/orderRepo.ts'
import { orderService } from '../services/orderService.ts'

const getOrderDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { flashSaleId } = req.params
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (!flashSaleId) {
      return res.status(400).json({ error: 'flashSaleId is required' })
    }

    const order = await orderRepo.getOrderByUserIdAndFlashSaleId(
      userId,
      flashSaleId
    )

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.json(order)
  } catch (error) {
    console.error('Order details error:', error)
    const message = error instanceof Error ? error.message : String(error)
    res
      .status(500)
      .json({ error: 'Failed to get order details', details: message })
  }
}

const purchaseOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: flashSaleId } = req.params
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (!flashSaleId) {
      return res.status(400).json({ error: 'flashSaleId is required' })
    }

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
