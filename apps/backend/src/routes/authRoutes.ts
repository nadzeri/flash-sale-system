import { Router } from 'express'
import { validateBody } from '../middleware/validation.ts'
import { z } from 'zod'
import { authController } from '../controllers/authController.ts'

const router = Router()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Routes
router.post('/register', validateBody(registerSchema), authController.register)
router.post('/login', validateBody(loginSchema), authController.login)

export default router
