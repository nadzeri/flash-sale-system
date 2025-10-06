import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock flashSaleRepo used by service for initial existence check
vi.mock('../../src/repositories/flashSaleRepo.ts', () => {
  return {
    flashSaleRepo: {
      getFlashSaleById: vi.fn(),
    },
  }
})

// Mock db connection and tables interactions used inside transaction
vi.mock('../../src/db/connection.ts', () => {
  return {
    db: {
      transaction: vi.fn(async (fn: any) => fn({
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ remainingStock: 0 }]) }),
          }),
        }),
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ onConflictDoNothing: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([null]) }) }) }),
      }) ),
    },
  }
})

// Mock schema exports used only for typing/column references
vi.mock('../../src/db/flashSaleSchema.ts', () => ({ flashSalesTable: {} as any }))
vi.mock('../../src/db/orderSchema.ts', () => ({ ordersTable: {} as any }))

describe('orderService', () => {
  beforeEach(() => {
    process.env.APP_STAGE = 'test'
  })

  it('throws 404 when flash sale not found', async () => {
    const { flashSaleRepo } = await import('../../src/repositories/flashSaleRepo.ts')
    const { orderService } = await import('../../src/services/orderService.ts')

    ;(flashSaleRepo.getFlashSaleById as any).mockResolvedValue(null)

    await expect(orderService.purchaseOrder('fs1', 'u1')).rejects.toMatchObject({ message: 'Flash sale not found', status: 404 })
  })
})


