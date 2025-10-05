const isOrderPurchased = async (flashSaleId: string) => {
  const response = await fetch(
    `http://localhost:3000/api/me/orders/${flashSaleId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
    }
  );

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const orderResponse = await response.json();

  return orderResponse.order !== null;
};

export const orderApi = {
  isOrderPurchased,
};
