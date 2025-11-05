"use client";

import { useId, useMemo, useState } from "react";

import type { ApiSalesReportDailyTrend } from "@/lib/types/api";
import { formatCurrency, formatNumber } from "@/lib/formatters";

interface SalesTrendChartProps {
  data: ApiSalesReportDailyTrend[];
}

interface ChartPoint {
  date: Date;
  label: string;
  sales: number;
  orders: number;
}

const DATE_LABEL = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const ACCESSIBLE_DATE = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const LEFT_PADDING = 48;
const RIGHT_PADDING = 32;
const TOP_PADDING = 24;
const BOTTOM_PADDING = 40;
const HEIGHT = 260;
const WIDTH = 720;

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const chartId = useId();

  const points = useMemo<ChartPoint[]>(() => {
    return data
      .filter((item) => item.date)
      .map((item) => {
        const parsed = new Date(item.date as string);
        return {
          date: parsed,
          label: DATE_LABEL.format(parsed),
          sales: item.total_sales,
          orders: item.order_count,
        } satisfies ChartPoint;
      });
  }, [data]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-slate-500">
        <p className="font-medium text-slate-700">No trend data</p>
        <p>We couldn&apos;t load daily sales yet. Check back once orders start flowing in.</p>
      </div>
    );
  }

  const maxSales = points.reduce((max, point) => Math.max(max, point.sales), 0) || 1;
  const maxOrders = points.reduce((max, point) => Math.max(max, point.orders), 0) || 1;
  const chartHeight = HEIGHT - TOP_PADDING - BOTTOM_PADDING;
  const chartWidth = WIDTH - LEFT_PADDING - RIGHT_PADDING;

  const getX = (index: number) => {
    if (points.length === 1) {
      return LEFT_PADDING + chartWidth / 2;
    }
    const ratio = index / (points.length - 1);
    return LEFT_PADDING + ratio * chartWidth;
  };

  const getSalesY = (value: number) => {
    if (maxSales === 0) return HEIGHT - BOTTOM_PADDING;
    const ratio = value / maxSales;
    return HEIGHT - BOTTOM_PADDING - ratio * chartHeight;
  };

  const getOrdersY = (value: number) => {
    if (maxOrders === 0) return HEIGHT - BOTTOM_PADDING;
    const ratio = value / maxOrders;
    return HEIGHT - BOTTOM_PADDING - ratio * chartHeight;
  };

  const areaPath = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${getX(index)},${getSalesY(point.sales)}`;
    })
    .join(" ");

  const closedAreaPath = `${areaPath} L${getX(points.length - 1)},${HEIGHT - BOTTOM_PADDING} L${getX(0)},${HEIGHT - BOTTOM_PADDING} Z`;

  const ordersPath = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${getX(index)},${getOrdersY(point.orders)}`;
    })
    .join(" ");

  const tickIndexes = (() => {
    if (points.length <= 4) {
      return points.map((_, index) => index);
    }
    const first = 0;
    const last = points.length - 1;
    const middle = Math.round(points.length / 2);
    const quarter = Math.round(points.length / 4);
    const threeQuarter = Math.round((3 * points.length) / 4);
    return Array.from(new Set([first, quarter, middle, threeQuarter, last])).sort((a, b) => a - b);
  })();

  const activePoint = activeIndex !== null ? points[activeIndex] : points[points.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Daily momentum</p>
        <div className="flex flex-wrap items-end gap-4">
          <p className="text-3xl font-semibold text-slate-900">{formatCurrency(activePoint.sales)}</p>
          <div className="flex gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-3 rounded-sm bg-emerald-500" aria-hidden />
              Sales
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-3 rounded-sm border border-sky-500" aria-hidden />
              Orders
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {ACCESSIBLE_DATE.format(activePoint.date)} · {formatNumber(activePoint.orders)} orders
        </p>
      </div>

      <div className="relative -mx-2">
        <svg
          aria-labelledby={`${chartId}-title`}
          className="w-full max-w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
        >
          <title id={`${chartId}-title`}>Daily sales and orders trend</title>
          <defs>
            <linearGradient id={`${chartId}-sales-gradient`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis gridlines */}
          {Array.from({ length: 4 }, (_, index) => index + 1).map((step) => {
            const ratio = step / 4;
            const y = HEIGHT - BOTTOM_PADDING - ratio * chartHeight;
            const salesValue = (maxSales * ratio).toFixed(0);
            return (
              <g key={`grid-${step}`}>
                <line
                  x1={LEFT_PADDING}
                  y1={y}
                  x2={WIDTH - RIGHT_PADDING}
                  y2={y}
                  stroke="rgb(226 232 240)"
                  strokeDasharray="4 6"
                  strokeWidth={1}
                />
                <text
                  x={LEFT_PADDING - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px]"
                >
                  {formatCurrency(Number(salesValue)).replace(/\.00$/, "")}
                </text>
              </g>
            );
          })}

          {/* Orders axis labels */}
          <line
            x1={WIDTH - RIGHT_PADDING}
            y1={TOP_PADDING}
            x2={WIDTH - RIGHT_PADDING}
            y2={HEIGHT - BOTTOM_PADDING}
            stroke="rgb(100 116 139)"
            strokeWidth={1}
            strokeOpacity={0.2}
          />
          {Array.from({ length: 4 }, (_, index) => index + 1).map((step) => {
            const ratio = step / 4;
            const y = HEIGHT - BOTTOM_PADDING - ratio * chartHeight;
            const ordersValue = Math.round(maxOrders * ratio);
            return (
              <text
                key={`orders-axis-${step}`}
                x={WIDTH - RIGHT_PADDING + 8}
                y={y + 4}
                textAnchor="start"
                className="fill-slate-400 text-[10px]"
              >
                {formatNumber(ordersValue)}
              </text>
            );
          })}

          {/* X-axis */}
          <line
            x1={LEFT_PADDING}
            y1={HEIGHT - BOTTOM_PADDING}
            x2={WIDTH - RIGHT_PADDING}
            y2={HEIGHT - BOTTOM_PADDING}
            stroke="rgb(100 116 139)"
            strokeWidth={1}
            strokeOpacity={0.2}
          />

          {/* Area for sales */}
          <path
            d={closedAreaPath}
            fill={`url(#${chartId}-sales-gradient)`}
            stroke="none"
            aria-hidden
          />

          {/* Sales line */}
          <path
            d={areaPath}
            fill="none"
            stroke="rgb(16 185 129)"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Orders line */}
          <path
            d={ordersPath}
            fill="none"
            stroke="rgb(14 165 233)"
            strokeWidth={2}
            strokeDasharray="6 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* X-axis ticks */}
          {tickIndexes.map((index) => {
            const point = points[index];
            const x = getX(index);
            return (
              <g key={`tick-${point.label}`}>
                <line
                  x1={x}
                  y1={HEIGHT - BOTTOM_PADDING}
                  x2={x}
                  y2={HEIGHT - BOTTOM_PADDING + 6}
                  stroke="rgb(148 163 184)"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={HEIGHT - BOTTOM_PADDING + 20}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px]"
                >
                  {point.label}
                </text>
              </g>
            );
          })}

          {/* Active indicator */}
          {activePoint ? (
            <g>
              <line
                x1={getX(points.indexOf(activePoint))}
                y1={TOP_PADDING}
                x2={getX(points.indexOf(activePoint))}
                y2={HEIGHT - BOTTOM_PADDING}
                stroke="rgb(15 118 110)"
                strokeDasharray="2 4"
                strokeOpacity={0.4}
              />
              <circle
                cx={getX(points.indexOf(activePoint))}
                cy={getSalesY(activePoint.sales)}
                r={5}
                fill="white"
                stroke="rgb(16 185 129)"
                strokeWidth={2}
              />
              <circle
                cx={getX(points.indexOf(activePoint))}
                cy={getOrdersY(activePoint.orders)}
                r={4}
                fill="white"
                stroke="rgb(14 165 233)"
                strokeWidth={2}
              />
            </g>
          ) : null}

          {/* Interaction overlays */}
          {points.map((_, index) => {
            const x = getX(index);
            const nextX = index === points.length - 1 ? WIDTH - RIGHT_PADDING : getX(index + 1);
            return (
              <rect
                key={`overlay-${index}`}
                x={index === 0 ? LEFT_PADDING : (x + getX(index - 1)) / 2}
                y={TOP_PADDING}
                width={
                  index === 0
                    ? (nextX - LEFT_PADDING) / 2
                    : index === points.length - 1
                      ? (WIDTH - RIGHT_PADDING - getX(index - 1)) / 2
                      : (nextX - getX(index - 1)) / 2
                }
                height={chartHeight + BOTTOM_PADDING}
                fill="transparent"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onBlur={() => setActiveIndex(null)}
                tabIndex={0}
                aria-label={`${ACCESSIBLE_DATE.format(points[index].date)}: ${formatCurrency(points[index].sales)}, ${formatNumber(points[index].orders)} orders`}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default SalesTrendChart;
