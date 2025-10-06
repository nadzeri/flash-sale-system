import { Order } from "@flash-sale/shared/types/orderType";

const ORDER_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/me/orders`;

const isOrderPurchased = async (flashSaleId: string) => {
  const response = await fetch(`${ORDER_API_URL}/${flashSaleId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    credentials: "include",
  });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const orderResponse: Order = await response.json();

  return orderResponse !== null;
};

export const orderApi = {
  isOrderPurchased,
};
