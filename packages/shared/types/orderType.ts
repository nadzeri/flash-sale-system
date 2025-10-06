export type Order = {
  id: string
  userId: string
  flashSaleId: string
  createdAt: Date
  updatedAt: Date
}
export type NewOrder = Pick<Order, 'userId' | 'flashSaleId'>
