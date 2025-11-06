"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/staff/products/product-table";
import { ProductFormModal } from "@/components/staff/products/product-form-modal";
import type { ApiProduct, ApiProductListResponse } from "@/lib/types/api";

interface ProductManagementClientProps {
  categories: string[];
  productsResponse: ApiProductListResponse;
  queryParams: Record<string, string>;
  canDelete: boolean;
}

export function ProductManagementClient({
  categories,
  productsResponse,
  queryParams,
  canDelete,
}: ProductManagementClientProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<ApiProduct | null>(null);

  const openCreateModal = () => setIsCreateOpen(true);
  const closeEditModal = () => setEditingProduct(null);

  const handleEdit = (product: ApiProduct) => {
    setEditingProduct(product);
  };

  return (
    <>
      <div className="flex justify-end">
        <Button type="button" onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Create product
        </Button>
      </div>

      <ProductTable
        data={productsResponse}
        queryParams={queryParams}
        canDelete={canDelete}
        onEdit={handleEdit}
      />

      <ProductFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        categories={categories}
      />

      {editingProduct ? (
        <ProductFormModal
          mode="edit"
          open={Boolean(editingProduct)}
          onOpenChange={(open) => {
            if (!open) {
              closeEditModal();
            }
          }}
          categories={categories}
          product={editingProduct}
        />
      ) : null}
    </>
  );
}
