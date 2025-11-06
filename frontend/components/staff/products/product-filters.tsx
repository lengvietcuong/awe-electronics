import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ProductFiltersProps {
  categories: string[];
  filters: {
    search?: string;
    category?: string;
    status?: string;
    availability?: string;
    sortBy: string;
    sortDirection: string;
  };
  resetHref: string;
}

export function ProductFilters({ categories, filters, resetHref }: ProductFiltersProps) {
  return (
    <form
      method="get"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Filter catalogue
          </p>
          <h2 className="text-xl font-semibold text-slate-900">Refine results</h2>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={resetHref}>Clear filters</Link>
          </Button>
          <Button type="submit" size="sm">
            Apply filters
          </Button>
        </div>
      </div>

      <input type="hidden" name="page" value="1" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="filter-search">
            Search
          </label>
          <Input
            id="filter-search"
            name="search"
            placeholder="Search name, brand, or model"
            defaultValue={filters.search ?? ""}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="filter-category">
            Category
          </label>
          <Select id="filter-category" name="category" defaultValue={filters.category ?? ""}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="filter-status">
            Status
          </label>
          <Select id="filter-status" name="status" defaultValue={filters.status ?? ""}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="filter-availability">
            Availability
          </label>
          <Select
            id="filter-availability"
            name="availability"
            defaultValue={filters.availability ?? ""}
          >
            <option value="">Any</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="filter-sort-by">
            Sort by
          </label>
          <Select id="filter-sort-by" name="sort_by" defaultValue={filters.sortBy}>
            <option value="created_at">Recently added</option>
            <option value="updated_at">Recently updated</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock">Stock level</option>
            <option value="availability">Availability</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="filter-sort-direction">
            Direction
          </label>
          <Select
            id="filter-sort-direction"
            name="sort_direction"
            defaultValue={filters.sortDirection}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
        </div>
      </div>
    </form>
  );
}
