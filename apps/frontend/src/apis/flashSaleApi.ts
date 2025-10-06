import { orderApi } from "./orderApi";
import { FlashSaleStatusResponse } from "@flash-sale/shared/types/flashSaleType";

const FLASH_SALE_API_URL = `${
  import.meta.env.VITE_API_BASE_URL
}/api/flash-sales`;

const fetchCurrentFlashSale = async () => {
  const response = await fetch(`${FLASH_SALE_API_URL}/current`, {
    credentials: "include",
  });

  if (response.status === 404) {
    return {
      status: "none",
    };
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const flashSaleResponse: FlashSaleStatusResponse = await response.json();

  let isOrderPurchased = false;
  try {
    isOrderPurchased = await orderApi.isOrderPurchased(
      flashSaleResponse.flashSale.id
    );
  } catch (error) {
    console.error(error);
  }

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
    `${FLASH_SALE_API_URL}/${flashSaleId}/purchase`,
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
