import { orderApi } from "./orderApi";

const fetchCurrentFlashSale = async () => {
  const response = await fetch(
    "http://localhost:3000/api/flash-sales/current",
    {
      credentials: "include",
    }
  );

  if (response.status === 404) {
    return {
      status: "none",
    };
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const flashSaleResponse = await response.json();

  const isOrderPurchased = await orderApi.isOrderPurchased(
    flashSaleResponse.flashSale.id
  );

  const startDate = flashSaleResponse?.flashSale?.startDate
    ? new Date(flashSaleResponse.flashSale.startDate)
    : undefined;
  const endDate = flashSaleResponse?.flashSale?.endDate
    ? new Date(flashSaleResponse.flashSale.endDate)
    : undefined;

  return {
    ...flashSaleResponse.flashSale,
    status: isOrderPurchased ? "purchased" : flashSaleResponse.status,
    startDate,
    endDate,
  } as const;
};

const purchaseOrder = async (flashSaleId: string) => {
  const response = await fetch(
    `http://localhost:3000/api/flash-sales/${flashSaleId}/purchase`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return await response.json();
};

export const flashSaleApi = {
  fetchCurrentFlashSale,
  purchaseOrder,
};
