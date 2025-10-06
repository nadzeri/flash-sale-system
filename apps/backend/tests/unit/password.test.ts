import { describe, it, expect, beforeAll } from 'vitest'

describe('password utils', () => {
  beforeAll(() => {
    process.env.APP_STAGE = process.env.APP_STAGE || 'test'
    process.env.NODE_ENV = process.env.NODE_ENV || 'test'
    process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '10'
  })

  it('hashes and compares password correctly', async () => {
    const { hashPassword, comparePassword, validatePasswordStrength } = await import('../../src/utils/password.ts')

    const raw = 'StrongPass123!'
    const { isValid } = validatePasswordStrength(raw)
    expect(isValid).toBe(true)

    const hashed = await hashPassword(raw)
    expect(typeof hashed).toBe('string')
    expect(hashed).not.toBe(raw)

    const match = await comparePassword(raw, hashed)
    expect(match).toBe(true)
  })

  it('validates weak password rules', async () => {
    const { validatePasswordStrength } = await import('../../src/utils/password.ts')
    const result = validatePasswordStrength('short')
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})


