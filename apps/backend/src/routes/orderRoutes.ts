import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import { orderController } from '../controllers/orderController.ts'
import { z } from 'zod'
import { validateParams } from '../middleware/validation.ts'

const router = Router()

const uuidSchema = z.object({
  flashSaleId: z.string().uuid('Invalid ID format'),
})

// Apply authentication to all routes
router.use(authenticateToken)

// Routes
router.get(
  '/:flashSaleId/details',
  validateParams(uuidSchema),
  orderController.getOrderDetails
)
router.post(
  '/:flashSaleId/purchase',
  validateParams(uuidSchema),
  orderController.purchaseOrder
)

export default router
