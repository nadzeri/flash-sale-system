import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/repositories/authRepo.ts', () => {
  return {
    authRepo: {
      getUserByEmail: vi.fn(),
      createUser: vi.fn(),
    },
  }
})

vi.mock('bcrypt', () => {
  return {
    default: {
      hash: vi.fn(async () => 'hashed'),
      compare: vi.fn(async (raw: string, hashed: string) => hashed === 'hashed' && raw === 'pass'),
    },
  }
})

describe('authService', () => {
  beforeEach(() => {
    process.env.APP_STAGE = 'test'
    process.env.BCRYPT_SALT_ROUNDS = '10'
  })

  it('registers new user and hashes password', async () => {
    const { authRepo } = await import('../../src/repositories/authRepo.ts')
    const { authService } = await import('../../src/services/authService.ts')

    ;(authRepo.getUserByEmail as any).mockResolvedValue(null)
    ;(authRepo.createUser as any).mockImplementation(async (u: any) => ({ id: 'u1', ...u }))

    const user = await authService.register('a@b.com', 'pass')

    expect(authRepo.getUserByEmail).toHaveBeenCalledWith('a@b.com')
    expect(authRepo.createUser).toHaveBeenCalled()
    expect(user).toMatchObject({ id: 'u1', email: 'a@b.com', password: 'hashed' })
  })

  it('register throws if user exists', async () => {
    const { authRepo } = await import('../../src/repositories/authRepo.ts')
    const { authService } = await import('../../src/services/authService.ts')

    ;(authRepo.getUserByEmail as any).mockResolvedValue({ id: 'u1' })

    await expect(authService.register('a@b.com', 'pass')).rejects.toThrow('User already exists')
  })

  it('findUser returns null for invalid password', async () => {
    const { authRepo } = await import('../../src/repositories/authRepo.ts')
    const { authService } = await import('../../src/services/authService.ts')

    ;(authRepo.getUserByEmail as any).mockResolvedValue({ id: 'u1', email: 'a@b.com', password: 'different' })

    const user = await authService.findUser('a@b.com', 'pass')
    expect(user).toBeNull()
  })

  it('findUser returns user for valid password', async () => {
    const { authRepo } = await import('../../src/repositories/authRepo.ts')
    const { authService } = await import('../../src/services/authService.ts')

    ;(authRepo.getUserByEmail as any).mockResolvedValue({ id: 'u1', email: 'a@b.com', password: 'hashed' })

    const user = await authService.findUser('a@b.com', 'pass')
    expect(user).toMatchObject({ id: 'u1', email: 'a@b.com' })
  })
})


