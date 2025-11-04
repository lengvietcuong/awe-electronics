import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface TrackingPackageItem {
  name: string;
  quantity: number;
  sku?: string | null;
}

export interface TrackingCostSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface TrackingPackageSummaryProps {
  items: TrackingPackageItem[];
  summary: TrackingCostSummary;
  notes?: string[];
}

export function TrackingPackageSummary({ items, summary, notes }: TrackingPackageSummaryProps) {
  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-lg">Items in this shipment</CardTitle>
        <CardDescription>Everything packed and on the way to you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table className="min-w-full">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border/60">
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.name}-${item.sku ?? "unknown"}`} className="border-border/60">
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.sku ?? "—"}</TableCell>
                  <TableCell className="text-right text-sm text-foreground">{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-foreground">${summary.subtotal.toLocaleString("en-AU")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span className="font-medium text-foreground">{summary.shipping === 0 ? "Included" : `$${summary.shipping.toLocaleString("en-AU")}`}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>GST</span>
            <span className="font-medium text-foreground">${summary.tax.toLocaleString("en-AU")}</span>
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-border/60 pt-2 text-base font-semibold text-foreground">
            <span>Total paid</span>
            <span>${summary.total.toLocaleString("en-AU")}</span>
          </div>
        </div>
      </CardContent>

      {notes?.length ? (
        <CardFooter className="flex-col items-start gap-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Fulfilment notes</p>
          <ul className="list-disc space-y-1 pl-4">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </CardFooter>
      ) : null}
    </Card>
  );
}
