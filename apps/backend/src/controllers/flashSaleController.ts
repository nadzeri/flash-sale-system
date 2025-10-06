import type { Request, Response } from 'express'
import { flashSaleService } from '../services/flashSaleService.ts'

const getFlashSaleStatus = async (req: Request, res: Response) => {
  try {
    const closestFlashSale = await flashSaleService.getClosestFlashSale()

    if (closestFlashSale) {
      return res.status(200).json(closestFlashSale)
    }

    return res.status(404).json({
      error: 'No flash sales found',
    })
  } catch (error) {
    console.error('Flash sale status error:', error)
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({
      error: 'Failed to get flash sale status',
      details: message,
    })
  }
}

const createFlashSale = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, totalStock } = req.body

    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)

    if (
      Number.isNaN(startDateObj.getTime()) ||
      Number.isNaN(endDateObj.getTime())
    ) {
      return res.status(400).json({ error: 'Invalid date values provided' })
    }
    if (startDateObj >= endDateObj) {
      return res.status(400).json({ error: 'startDate must be before endDate' })
    }

    const newFlashSale = await flashSaleService.createFlashSale(
      startDateObj,
      endDateObj,
      totalStock
    )

    res.status(201).json({
      message: 'Flash sale created successfully',
      flashSale: newFlashSale,
    })
  } catch (error) {
    console.error('Flash sale creation error:', error)
    const message = error instanceof Error ? error.message : String(error)
    res
      .status(500)
      .json({ error: 'Failed to create flash sale', details: message })
  }
}

export const flashSaleController = {
  getFlashSaleStatus,
  createFlashSale,
}
