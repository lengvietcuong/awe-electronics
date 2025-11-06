"use server";

import { revalidatePath } from "next/cache";

import {
  adjustProductStock,
  createProduct,
  deleteProduct,
  type AdjustStockPayload,
  type CreateProductPayload,
  type UpdateProductPayload,
  updateProduct,
} from "@/lib/api/admin/products";

async function revalidateProductSurfaces(productId?: number) {
  const paths = ["/", "/products", "/staff", "/staff/products", "/manager"];
  for (const path of paths) {
    revalidatePath(path);
  }
  if (productId) {
    revalidatePath(`/products/${productId}`);
  }
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to process product request.";
}

export async function adjustProductStockAction(
  productId: number,
  payload: AdjustStockPayload,
) {
  try {
    await adjustProductStock(productId, payload);
    await revalidateProductSurfaces(productId);
    return { success: true } as const;
  } catch (error) {
    return {
      success: false as const,
      error: extractErrorMessage(error),
    };
  }
}

export async function createProductAction(payload: CreateProductPayload) {
  try {
    const product = await createProduct(payload);
    await revalidateProductSurfaces(product.id);
    return { success: true as const, product };
  } catch (error) {
    return {
      success: false as const,
      error: extractErrorMessage(error),
    };
  }
}

export async function updateProductAction(
  productId: number,
  payload: UpdateProductPayload,
) {
  try {
    const product = await updateProduct(productId, payload);
    await revalidateProductSurfaces(product.id);
    return { success: true as const, product };
  } catch (error) {
    return {
      success: false as const,
      error: extractErrorMessage(error),
    };
  }
}

export async function activateProductAction(productId: number) {
  try {
    const product = await updateProduct(productId, {
      is_active: true,
    });
    await revalidateProductSurfaces(product.id);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: extractErrorMessage(error),
    };
  }
}

export async function deleteProductAction(productId: number) {
  try {
    await deleteProduct(productId);
    await revalidateProductSurfaces();
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: extractErrorMessage(error),
    };
  }
}
