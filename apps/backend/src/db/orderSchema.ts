import { pgTable, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './userSchema.ts'
import { flashSalesTable } from './flashSaleSchema.ts'
import { relations } from 'drizzle-orm'
import { injectCreatedAtAndUpdatedAt } from './utils/index.ts'

export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => usersTable.id)
    .notNull(),
  flashSaleId: uuid('flash_sale_id')
    .references(() => flashSalesTable.id)
    .notNull(),
  ...injectCreatedAtAndUpdatedAt(),
})

export const orderTableRelations = relations(ordersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.id],
  }),
  flashSale: one(flashSalesTable, {
    fields: [ordersTable.flashSaleId],
    references: [flashSalesTable.id],
  }),
}))
