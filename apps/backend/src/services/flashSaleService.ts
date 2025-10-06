import { flashSaleRepo } from '../repositories/flashSaleRepo.ts'
import type {
  FlashSaleStatusResponse,
  NewFlashSale,
} from '@flash-sale/shared/types/flashSaleType.ts'

const getClosestFlashSale =
  async (): Promise<FlashSaleStatusResponse | null> => {
    // 1. Try to get flash sale active
    const currentFlashSale = await flashSaleRepo.getCurrentFlashSale()

    if (currentFlashSale) {
      return {
        flashSale: currentFlashSale,
        status: currentFlashSale.remainingStock > 0 ? 'active' : 'ended',
      }
    }

    // 2. Try to get next flash sale
    const nextFlashSale = await flashSaleRepo.getNextFlashSale()

    if (nextFlashSale) {
      return {
        flashSale: nextFlashSale,
        status: 'upcoming',
      }
    }

    // 3. Try to get previous flash sale
    const previousFlashSale = await flashSaleRepo.getPreviousFlashSale()

    if (previousFlashSale) {
      return {
        flashSale: previousFlashSale,
        status: 'ended',
      }
    }

    // 4. If no flash sales exist at all, return null
    return null
  }

const createFlashSale = async (
  startDate: Date,
  endDate: Date,
  totalStock: number
) => {
  const existingFlashSale = await flashSaleRepo.getOverlappingFlashSale(
    startDate,
    endDate
  )
  if (existingFlashSale) {
    throw new Error('Flash sale overlaps with existing flash sale')
  }

  const flashSale: NewFlashSale = {
    startDate,
    endDate,
    totalStock,
    remainingStock: totalStock,
  }
  const newFlashSale = await flashSaleRepo.createFlashSale(flashSale)

  return newFlashSale
}

export const flashSaleService = {
  getClosestFlashSale,
  createFlashSale,
}
