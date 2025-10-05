import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import {
  getOrderDetails,
  purchaseOrder,
} from '../controllers/orderController.ts'
import { z } from 'zod'
import { validateParams } from '../middleware/validation.ts'

const router = Router()

const uuidSchema = z.object({
  flashSaleId: z.string().uuid('Invalid ID format'),
})

// Apply authentication to all routes
router.use(authenticateToken)

// Routes
router.get('/:flashSaleId/details', validateParams(uuidSchema), getOrderDetails)
router.post('/:flashSaleId/purchase', validateParams(uuidSchema), purchaseOrder)

export default router
