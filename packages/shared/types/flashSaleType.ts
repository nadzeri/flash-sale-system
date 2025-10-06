export type FlashSale = {
  id: string
  startDate: Date
  endDate: Date
  totalStock: number
  remainingStock: number
  createdAt: Date
  updatedAt: Date
}
export type NewFlashSale = Pick<
  FlashSale,
  'startDate' | 'endDate' | 'totalStock' | 'remainingStock'
>

export type FlashSaleStatus = 'active' | 'upcoming' | 'ended'
export type FlashSaleStatusResponse = {
  flashSale: FlashSale
  status: FlashSaleStatus
}
