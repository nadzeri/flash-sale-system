import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../middleware/validation.ts'
import { flashSaleController } from '../controllers/flashSaleController.ts'

const router = Router()

// Validation schemas
const createFlashSaleSchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  totalStock: z.number().int('Total stock must be an integer'),
})

// Routes
router.get('/status', flashSaleController.getFlashSaleStatus)
router.post(
  '/create',
  validateBody(createFlashSaleSchema),
  flashSaleController.createFlashSale
)

export default router
