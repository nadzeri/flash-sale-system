import type { Request, Response } from 'express'
import db from '../db/connection.ts'
import { flashSalesTable } from '../db/flashSaleSchema.ts'
import { and, gte, lte, desc, asc } from 'drizzle-orm'

export const getFlashSaleStatus = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date()

    // 1. Try to get flash sale active on current date
    const [currentFlashSale] = await db
      .select()
      .from(flashSalesTable)
      .where(
        and(
          lte(flashSalesTable.startDate, currentDate),
          gte(flashSalesTable.endDate, currentDate)
        )
      )
      .limit(1)

    if (currentFlashSale) {
      return res.json({
        message: 'Current flash sale found',
        flashSale: currentFlashSale,
        status: 'active',
      })
    }

    // 2. If no current flash sale, try to get the next upcoming flash sale
    const [nextFlashSale] = await db
      .select()
      .from(flashSalesTable)
      .where(gte(flashSalesTable.startDate, currentDate))
      .orderBy(asc(flashSalesTable.startDate))
      .limit(1)

    if (nextFlashSale) {
      return res.json({
        message: 'Next flash sale found',
        flashSale: nextFlashSale,
        status: 'upcoming',
      })
    }

    // 3. If no upcoming flash sale, try to get the most recent previous flash sale
    const [previousFlashSale] = await db
      .select()
      .from(flashSalesTable)
      .where(lte(flashSalesTable.endDate, currentDate))
      .orderBy(desc(flashSalesTable.endDate))
      .limit(1)

    if (previousFlashSale) {
      return res.json({
        message: 'Previous flash sale found',
        flashSale: previousFlashSale,
        status: 'ended',
      })
    }

    // 4. If no flash sales exist at all, return 404
    return res.status(404).json({
      error: 'No flash sales found',
    })
  } catch (error) {
    console.error('Flash sale status error:', error)
    res.status(500).json({ error: 'Failed to get flash sale status' })
  }
}

export const createFlashSale = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, totalStock } = req.body

    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)

    if (Number.isNaN(startDateObj.getTime()) || Number.isNaN(endDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date values provided' })
    }
    if (startDateObj >= endDateObj) {
      return res.status(400).json({ error: 'startDate must be before endDate' })
    }

    // add check if flash sale will overlap with existing flash sale
    const [existingFlashSale] = await db
      .select()
      .from(flashSalesTable)
      .where(
        and(
          lte(flashSalesTable.startDate, endDateObj), // existing start <= new end
          gte(flashSalesTable.endDate, startDateObj) // existing end >= new start
        )
      )
      .limit(1)

    if (existingFlashSale) {
      return res
        .status(400)
        .json({ error: 'Flash sale overlaps with existing flash sale' })
    }

    const newFlashSale = await db
      .insert(flashSalesTable)
      .values({ startDate: startDateObj, endDate: endDateObj, totalStock, remainingStock: totalStock })
      .returning()

    res.status(201).json({
      message: 'Flash sale created successfully',
      flashSale: newFlashSale,
    })
  } catch (error) {
    console.error('Flash sale creation error:', error)
    res.status(500).json({ error: 'Failed to create flash sale' })
  }
}
