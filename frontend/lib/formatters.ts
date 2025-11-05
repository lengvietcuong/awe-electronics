const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

const numberFormatter = new Intl.NumberFormat("en-AU");

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return currencyFormatter.format(value);
}

export function formatNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  if (options) {
    return new Intl.NumberFormat("en-AU", options).format(value);
  }
  return numberFormatter.format(value);
}

export function formatPercent(value: number | null | undefined, fractionDigits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatDate(
  date: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
) {
  if (!date) {
    return "—";
  }

  const parsedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-AU", options);
}

export function formatStockStatus(isAvailable: boolean, isLowStock: boolean) {
  if (!isAvailable) return "Currently unavailable";
  if (isLowStock) return "Low stock";
  return "In stock";
}

export function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}
