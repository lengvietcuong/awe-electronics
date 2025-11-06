"use server";

import {
  deleteOrder,
  markOrderDelivered,
  shipOrder,
  type ShipOrderPayload,
} from "@/lib/api/admin/orders";

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong while processing the order.";
}

export async function shipOrderAction(
  orderId: number,
  payload: ShipOrderPayload = {},
) {
  try {
    await shipOrder(orderId, payload);
    // Note: We don't revalidate immediately here to allow the UI to show
    // the success state for a moment before the row disappears.
    // The component will call router.refresh() after a delay.
    return { success: true } as const;
  } catch (error) {
    return {
      success: false as const,
      error: extractErrorMessage(error),
    };
  }
}

export async function markOrderDeliveredAction(orderId: number) {
  try {
    await markOrderDelivered(orderId);
    // Note: We don't revalidate immediately here to allow the UI to show
    // the success state for a moment before the row disappears.
    // The component will call router.refresh() after showing the message.
    return { success: true } as const;
  } catch (error) {
    return {
      success: false as const,
      error: extractErrorMessage(error),
    };
  }
}

export async function deleteOrderAction(orderId: number) {
  try {
    await deleteOrder(orderId);
    // Note: We don't revalidate immediately here to allow the UI to show
    // a success state for a moment before the row disappears.
    // The component will handle the refresh after showing confirmation.
    return { success: true } as const;
  } catch (error) {
    return {
      success: false as const,
      error: extractErrorMessage(error),
    };
  }
}
