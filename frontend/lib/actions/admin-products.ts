"use server";

import { revalidatePath } from "next/cache";

import {
  adjustProductStock,
  type AdjustStockPayload,
} from "@/lib/api/admin/products";

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to update product stock.";
}

export async function adjustProductStockAction(
  productId: number,
  payload: AdjustStockPayload,
) {
  try {
    await adjustProductStock(productId, payload);
    revalidatePath("/staff");
    revalidatePath("/manager");
    return { success: true } as const;
  } catch (error) {
    return {
      success: false as const,
      error: extractErrorMessage(error),
    };
  }
}
