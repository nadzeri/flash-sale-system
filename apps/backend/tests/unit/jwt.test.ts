import { describe, it, expect, beforeAll } from 'vitest'

describe('jwt utils', () => {
  beforeAll(() => {
    // Ensure JWT secret is set for tests
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-1234'
    }
    process.env.APP_STAGE = process.env.APP_STAGE || 'test'
    process.env.NODE_ENV = process.env.NODE_ENV || 'test'
  })

  it('generates and verifies a token', async () => {
    const { generateToken, verifyToken } = await import('../../src/utils/jwt.ts')

    const payload = { id: 'user-1', email: 'user@example.com' }
    const token = await generateToken(payload)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(10)

    const decoded = await verifyToken(token)
    expect(decoded).toEqual(payload)
  })
})


