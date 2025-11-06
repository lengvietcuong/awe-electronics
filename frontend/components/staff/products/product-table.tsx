import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProductStatusBadges } from "@/components/staff/products/product-status-badge";
import { ProductRowActions } from "@/components/staff/products/product-row-actions";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import type { ApiProduct, ApiProductListResponse } from "@/lib/types/api";

interface ProductTableProps {
  data: ApiProductListResponse;
  queryParams: Record<string, string>;
  canDelete: boolean;
  onEdit: (product: ApiProduct) => void;
}

function buildHref(
  queryParams: Record<string, string>,
  overrides: Record<string, string | number | undefined> = {},
) {
  const params = new URLSearchParams(queryParams);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
  const queryString = params.toString();
  return queryString ? `/staff/products?${queryString}` : "/staff/products";
}

export function ProductTable({ data, queryParams, canDelete, onEdit }: ProductTableProps) {
  if (data.products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-600">
        <h3 className="text-lg font-semibold text-slate-900">No products available yet</h3>
        <p className="mt-2 text-sm">
          Add a product using the form above to start building the catalogue.
        </p>
      </div>
    );
  }

  const totalPages = data.total_pages;
  const currentPage = data.page;
  const prevHref = currentPage > 1 ? buildHref(queryParams, { page: currentPage - 1, edit: undefined }) : null;
  const nextHref =
    totalPages > currentPage ? buildHref(queryParams, { page: currentPage + 1, edit: undefined }) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[24rem]">Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pricing</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.products.map((product) => {
            const reserved = product.stock_quantity - product.available_quantity;

            return (
              <TableRow key={product.id} className="border-slate-100">
                <TableCell>
                  <div className="flex flex-col gap-1 text-slate-800">
                    <div className="text-base font-semibold text-slate-900">{product.name}</div>
                    <div className="text-xs text-slate-600">
                      {product.brand ? `${product.brand} · ` : ""}
                      {product.category}
                      {product.model_number ? ` · ${product.model_number}` : ""}
                    </div>
                    {product.description ? (
                      <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <ProductStatusBadges product={product} />
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-900">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-slate-600">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatNumber(product.available_quantity)} available
                    </span>
                    <span>{formatNumber(product.stock_quantity)} on hand</span>
                    <span>{formatNumber(reserved)} reserved</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-900">
                  {formatDate(product.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <ProductRowActions
                    product={product}
                    onEdit={() => onEdit(product)}
                    canDelete={canDelete}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          <span>
            Page {currentPage} of {totalPages} · {data.total} products total
          </span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={!prevHref}>
              {prevHref ? <Link href={prevHref}>Previous</Link> : <span>Previous</span>}
            </Button>
            <Button asChild variant="outline" size="sm" disabled={!nextHref}>
              {nextHref ? <Link href={nextHref}>Next</Link> : <span>Next</span>}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Showing {data.products.length} of {data.total} products
        </div>
      )}
    </div>
  );
}
