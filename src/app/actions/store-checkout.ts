"use server";

import { createOrder, CreateOrderParams, OrderCreationResult } from "@/services/orders";

export async function submitCheckoutOrder(params: CreateOrderParams): Promise<OrderCreationResult> {
  return await createOrder(params);
}
