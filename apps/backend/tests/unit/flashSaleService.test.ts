import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/repositories/flashSaleRepo.ts', () => {
  return {
    flashSaleRepo: {
      getCurrentFlashSale: vi.fn(),
      getNextFlashSale: vi.fn(),
      getPreviousFlashSale: vi.fn(),
      getOverlappingFlashSale: vi.fn(),
      createFlashSale: vi.fn(),
    },
  }
})

describe('flashSaleService', () => {
  beforeEach(() => {
    process.env.APP_STAGE = 'test'
  })

  it('returns active when current flash sale exists', async () => {
    const { flashSaleRepo } = await import('../../src/repositories/flashSaleRepo.ts')
    const { flashSaleService } = await import('../../src/services/flashSaleService.ts')

    ;(flashSaleRepo.getCurrentFlashSale as any).mockResolvedValue({ id: 'fs1', remainingStock: 2 })

    const res = await flashSaleService.getClosestFlashSale()
    expect(res).toEqual({ flashSale: { id: 'fs1', remainingStock: 2 }, status: 'active' })
  })

  it('returns ended when current flash sale stock is 0', async () => {
    const { flashSaleRepo } = await import('../../src/repositories/flashSaleRepo.ts')
    const { flashSaleService } = await import('../../src/services/flashSaleService.ts')

    ;(flashSaleRepo.getCurrentFlashSale as any).mockResolvedValue({ id: 'fs1', remainingStock: 0 })

    const res = await flashSaleService.getClosestFlashSale()
    expect(res).toEqual({ flashSale: { id: 'fs1', remainingStock: 0 }, status: 'ended' })
  })

  it('falls back to next then previous then null', async () => {
    const { flashSaleRepo } = await import('../../src/repositories/flashSaleRepo.ts')
    const { flashSaleService } = await import('../../src/services/flashSaleService.ts')

    ;(flashSaleRepo.getCurrentFlashSale as any).mockResolvedValue(null)
    ;(flashSaleRepo.getNextFlashSale as any).mockResolvedValue({ id: 'fs2' })

    const res1 = await flashSaleService.getClosestFlashSale()
    expect(res1).toEqual({ flashSale: { id: 'fs2' }, status: 'upcoming' })

    ;(flashSaleRepo.getNextFlashSale as any).mockResolvedValue(null)
    ;(flashSaleRepo.getPreviousFlashSale as any).mockResolvedValue({ id: 'fs3' })
    const res2 = await flashSaleService.getClosestFlashSale()
    expect(res2).toEqual({ flashSale: { id: 'fs3' }, status: 'ended' })

    ;(flashSaleRepo.getPreviousFlashSale as any).mockResolvedValue(null)
    const res3 = await flashSaleService.getClosestFlashSale()
    expect(res3).toBeNull()
  })

  it('createFlashSale rejects overlaps and creates otherwise', async () => {
    const { flashSaleRepo } = await import('../../src/repositories/flashSaleRepo.ts')
    const { flashSaleService } = await import('../../src/services/flashSaleService.ts')

    const start = new Date()
    const end = new Date(Date.now() + 60_000)

    ;(flashSaleRepo.getOverlappingFlashSale as any).mockResolvedValue({ id: 'existing' })
    await expect(
      flashSaleService.createFlashSale(start, end, 5)
    ).rejects.toThrow('Flash sale overlaps with existing flash sale')

    ;(flashSaleRepo.getOverlappingFlashSale as any).mockResolvedValue(null)
    ;(flashSaleRepo.createFlashSale as any).mockImplementation(async (fs: any) => ({ id: 'new', ...fs }))

    const created = await flashSaleService.createFlashSale(start, end, 5)
    expect(created).toMatchObject({ id: 'new', totalStock: 5, remainingStock: 5 })
  })
})


