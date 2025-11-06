"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { ApiProduct } from "@/lib/types/api";
import {
  createProductAction,
  updateProductAction,
} from "@/lib/actions/admin-products";

const DEFAULT_LOW_STOCK = 10;

type ProductFormMode = "create" | "edit";

type ProductFieldState = {
  name: string;
  category: string;
  brand: string;
  modelNumber: string;
  price: string;
  stock: string;
  lowStock: string;
  imageUrl: string;
  description: string;
  specifications: string;
};

interface ProductFormModalProps {
  mode: ProductFormMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  product?: ApiProduct;
}

function parseNumberInput(value: string) {
  if (value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getInitialState(
  mode: ProductFormMode,
  categories: string[],
  product?: ApiProduct,
): ProductFieldState {
  if (mode === "edit" && product) {
    return {
      name: product.name,
      category: product.category,
      brand: product.brand ?? "",
      modelNumber: product.model_number ?? "",
      price: String(product.price),
      stock: String(product.stock_quantity),
      lowStock: String(product.low_stock_threshold),
      imageUrl: product.image_url ?? "",
      description: product.description ?? "",
      specifications: product.specifications ?? "",
    };
  }

  return {
    name: "",
    category: categories[0] ?? "",
    brand: "",
    modelNumber: "",
    price: "",
    stock: "0",
    lowStock: String(DEFAULT_LOW_STOCK),
    imageUrl: "",
    description: "",
    specifications: "",
  };
}

export function ProductFormModal({
  mode,
  open,
  onOpenChange,
  categories,
  product,
}: ProductFormModalProps) {
  const router = useRouter();
  const [formState, setFormState] = React.useState<ProductFieldState>(() =>
    getInitialState(mode, categories, product),
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const primaryLabel = mode === "create" ? "Create product" : "Save changes";
  const title = mode === "create" ? "Create product" : `Edit · ${product?.name ?? "Product"}`;
  const subtitle =
    mode === "create"
      ? "Add a new item to the catalogue."
      : "Update the details for this catalogue item.";

  React.useEffect(() => {
    if (open) {
      setFormState(getInitialState(mode, categories, product));
      setError(null);
    }
  }, [open, mode, categories, product]);

  const closeModal = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const updateField = <K extends keyof ProductFieldState>(key: K, value: ProductFieldState[K]) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!formState.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formState.category) {
      setError("Select a category for the product.");
      return;
    }

    const numericPrice = parseNumberInput(formState.price);
    if (numericPrice === undefined || numericPrice <= 0) {
      setError("Enter a valid price above zero.");
      return;
    }

    const numericStock = parseNumberInput(formState.stock);
    if (numericStock !== undefined && numericStock < 0) {
      setError("Stock quantity cannot be negative.");
      return;
    }

    const numericLowStock = parseNumberInput(formState.lowStock);
    if (numericLowStock !== undefined && numericLowStock < 0) {
      setError("Low stock threshold must be zero or higher.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: formState.name.trim(),
        category: formState.category,
        brand: formState.brand.trim() || undefined,
        model_number: formState.modelNumber.trim() || undefined,
        description: formState.description.trim() || undefined,
        specifications: formState.specifications.trim() || undefined,
        price: numericPrice,
        stock_quantity: numericStock ?? (mode === "create" ? 0 : product?.stock_quantity ?? 0),
        low_stock_threshold:
          numericLowStock ??
          (mode === "create"
            ? DEFAULT_LOW_STOCK
            : product?.low_stock_threshold ?? DEFAULT_LOW_STOCK),
        image_url: formState.imageUrl.trim() || undefined,
      };

      const result =
        mode === "create"
          ? await createProductAction(payload)
          : product
            ? await updateProductAction(product.id, payload)
            : { success: false as const, error: "Product not found." };

      if (!result?.success) {
        setError(result?.error ?? "Unable to save product.");
        return;
      }

      if (mode === "create") {
        setFormState(getInitialState(mode, categories));
      }

      closeModal();
      router.refresh();
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={closeModal}
        aria-label="Close"
      />

      <div
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        role="document"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {mode === "create" ? "Add product" : "Edit product"}
              </p>
              <h2 id="product-form-modal-title" className="text-2xl font-semibold text-slate-900">
                {title}
              </h2>
              <p className="text-sm text-slate-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={closeModal}
                disabled={isPending}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {mode === "create" ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isPending ? "Saving…" : primaryLabel}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-name">
                Name
              </label>
              <Input
                id="modal-product-name"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Pro Display XDR"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-category">
                Category
              </label>
              <Select
                id="modal-product-category"
                value={formState.category}
                onChange={(event) => updateField("category", event.target.value)}
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-brand">
                Brand
              </label>
              <Input
                id="modal-product-brand"
                value={formState.brand}
                onChange={(event) => updateField("brand", event.target.value)}
                placeholder="Apple"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-model">
                Model number
              </label>
              <Input
                id="modal-product-model"
                value={formState.modelNumber}
                onChange={(event) => updateField("modelNumber", event.target.value)}
                placeholder="MWD82X/A"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-image">
                Image URL
              </label>
              <Input
                id="modal-product-image"
                value={formState.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                placeholder="https://cdn.example.com/display.jpg"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-price">
                Price (AUD)
              </label>
              <Input
                id="modal-product-price"
                type="number"
                min="0"
                step="0.01"
                value={formState.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="699.99"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-stock">
                Stock quantity
              </label>
              <Input
                id="modal-product-stock"
                type="number"
                min="0"
                step="1"
                value={formState.stock}
                onChange={(event) => updateField("stock", event.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-low-stock">
                Low stock threshold
              </label>
              <Input
                id="modal-product-low-stock"
                type="number"
                min="0"
                step="1"
                value={formState.lowStock}
                onChange={(event) => updateField("lowStock", event.target.value)}
                placeholder={String(DEFAULT_LOW_STOCK)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-description">
              Description
            </label>
            <Textarea
              id="modal-product-description"
              value={formState.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Short marketing description for the product"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="modal-product-specs">
              Key specifications
            </label>
            <Textarea
              id="modal-product-specs"
              value={formState.specifications}
              onChange={(event) => updateField("specifications", event.target.value)}
              placeholder="Optional bullet list or paragraph of highlights"
              rows={3}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
