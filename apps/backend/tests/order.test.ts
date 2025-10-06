import request from 'supertest'
import app from '../src/server.ts'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanupDatabase, createTestFlashSale, createTestUser } from './helpers/dbHelpers.ts'

describe('Order Endpoints', () => {
  afterEach(async () => {
    await cleanupDatabase()
  })

  it('POST /api/flash-sales/:id/purchase requires auth', async () => {
    const fs = await createTestFlashSale()

    await request(app)
      .post(`/api/flash-sales/${fs.id}/purchase`)
      .expect(401)
  })

  it('POST /api/flash-sales/:id/purchase creates order and decrements stock', async () => {
    const { token, user } = await createTestUser()
    const fs = await createTestFlashSale({ totalStock: 2, remainingStock: 2 })

    const res = await request(app)
      .post(`/api/flash-sales/${fs.id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toHaveProperty('order')
    expect(res.body.order.flashSaleId).toBe(fs.id)
    expect(res.body.order.userId).toBe(user.id)
  })

  it('POST /api/flash-sales/:id/purchase prevents duplicate per user', async () => {
    const { token } = await createTestUser()
    const fs = await createTestFlashSale({ totalStock: 2, remainingStock: 2 })

    await request(app)
      .post(`/api/flash-sales/${fs.id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const res2 = await request(app)
      .post(`/api/flash-sales/${fs.id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    expect(res2.body).toHaveProperty('error', 'Order already purchased')
  })

  it('POST /api/flash-sales/:id/purchase returns out of stock when exhausted', async () => {
    const u1 = await createTestUser()
    const u2 = await createTestUser()
    const fs = await createTestFlashSale({ totalStock: 1, remainingStock: 1 })

    await request(app)
      .post(`/api/flash-sales/${fs.id}/purchase`)
      .set('Authorization', `Bearer ${u1.token}`)
      .expect(200)

    const res2 = await request(app)
      .post(`/api/flash-sales/${fs.id}/purchase`)
      .set('Authorization', `Bearer ${u2.token}`)
      .expect(400)

    expect(res2.body).toHaveProperty('error', 'Flash sale is out of stock')
  })

  it('GET /api/me/orders/:flashSaleId returns order details for user', async () => {
    const { token } = await createTestUser()
    const fs = await createTestFlashSale({ totalStock: 1, remainingStock: 1 })

    await request(app)
      .post(`/api/flash-sales/${fs.id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const res = await request(app)
      .get(`/api/me/orders/${fs.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('flashSaleId', fs.id)
  })
})


