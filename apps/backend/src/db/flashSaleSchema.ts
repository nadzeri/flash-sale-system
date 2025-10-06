import { integer, pgTable, timestamp, uuid, index } from 'drizzle-orm/pg-core'
import { injectCreatedAtAndUpdatedAt } from './utils/index.ts'

export const flashSalesTable = pgTable(
  'flash_sales',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    totalStock: integer('total_stock').notNull(),
    remainingStock: integer('remaining_stock').notNull(),
    ...injectCreatedAtAndUpdatedAt(),
  },
  (table) => [
    index('flash_sales_start_date_index').on(table.startDate),
    index('flash_sales_end_date_index').on(table.endDate),
    index('flash_sales_start_date_end_date_index').on(
      table.startDate,
      table.endDate
    ),
  ]
)
