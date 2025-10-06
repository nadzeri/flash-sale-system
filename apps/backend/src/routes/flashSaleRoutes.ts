import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { flashSaleController } from '../controllers/flashSaleController.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { orderController } from '../controllers/orderController.ts'

const router = Router()

// Validation schemas
const createFlashSaleSchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  totalStock: z.number().int('Total stock must be an integer'),
})

const uuidSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})

// Routes
router.get('/current', flashSaleController.getFlashSaleStatus)
router.post(
  '/',
  validateBody(createFlashSaleSchema),
  flashSaleController.createFlashSale
)

router.post(
  '/:id/purchase',
  authenticateToken,
  validateParams(uuidSchema),
  orderController.purchaseOrder
)

export default router
