import request from 'supertest'
import app from '../../src/server.ts'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanupDatabase, createTestFlashSale } from '../helpers/dbHelpers.ts'

describe('Flash Sale Endpoints', () => {
  afterEach(async () => {
    await cleanupDatabase()
  })

  it('GET /api/flash-sales/current returns 404 when none exist', async () => {
    const res = await request(app).get('/api/flash-sales/current').expect(404)
    expect(res.body).toHaveProperty('error', 'No flash sales found')
  })

  it('GET /api/flash-sales/current returns active sale', async () => {
    const fs = await createTestFlashSale()

    const res = await request(app).get('/api/flash-sales/current').expect(200)
    expect(res.body).toHaveProperty('flashSale')
    expect(res.body.flashSale.id).toBe(fs.id)
    expect(res.body).toHaveProperty('status')
  })

  it('POST /api/flash-sales creates a new flash sale', async () => {
    const now = Date.now()
    const payload = {
      startDate: new Date(now + 60_000).toISOString(),
      endDate: new Date(now + 120_000).toISOString(),
      totalStock: 10,
    }

    const res = await request(app)
      .post('/api/flash-sales')
      .send(payload)
      .expect(201)

    expect(res.body).toHaveProperty('message', 'Flash sale created successfully')
    expect(res.body).toHaveProperty('flashSale')
    expect(res.body.flashSale.totalStock).toBe(10)
  })

  it('POST /api/flash-sales rejects overlapping sale', async () => {
    const now = Date.now()
    // First sale
    await request(app)
      .post('/api/flash-sales')
      .send({
        startDate: new Date(now + 60_000).toISOString(),
        endDate: new Date(now + 600_000).toISOString(),
        totalStock: 5,
      })
      .expect(201)

    // Overlapping sale
    const res = await request(app)
      .post('/api/flash-sales')
      .send({
        startDate: new Date(now + 120_000).toISOString(),
        endDate: new Date(now + 700_000).toISOString(),
        totalStock: 5,
      })
      .expect(500)

    expect(res.body).toHaveProperty(
      'error',
      'Failed to create flash sale'
    )
    expect(res.body).toHaveProperty('details', 'Flash sale overlaps with existing flash sale')
  })
})


