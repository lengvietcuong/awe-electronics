export function formatStockStatus(isAvailable: boolean, isLowStock: boolean) {
  if (!isAvailable) return "Currently unavailable";
  if (isLowStock) return "Low stock";
  return "In stock";
}
