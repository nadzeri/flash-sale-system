import { env, isDev, isTestEnv } from '../env.ts'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/authRoutes.ts'
import morgan from 'morgan'
import flashSaleRoutes from './routes/flashSaleRoutes.ts'
import orderRoutes from './routes/orderRoutes.ts'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin:
      env.CORS_ORIGIN.length > 0
        ? env.CORS_ORIGIN
        : ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  morgan('dev', {
    skip: () => isTestEnv(),
  })
)
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'User Management API',
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/flash-sales', flashSaleRoutes)
app.use('/api/me/orders', orderRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  })
})

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).json({
      error: 'Something went wrong!',
      ...(isDev() && { details: err.message }),
    })
  }
)

export { app }

export default app
