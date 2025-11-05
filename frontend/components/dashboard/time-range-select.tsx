"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Select } from "@/components/ui/select";

export interface TimeRangeOption {
  value: string;
  label: string;
}

interface TimeRangeSelectProps {
  options: readonly TimeRangeOption[];
  value: string;
}

export function TimeRangeSelect({ options, value }: TimeRangeSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.target.value;
      startTransition(() => {
        const params = new URLSearchParams(searchParams?.toString());
        if (!nextValue || nextValue === "default") {
          params.delete("range");
        } else {
          params.set("range", nextValue);
        }

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        router.refresh();
      });
    },
    [pathname, router, searchParams, startTransition],
  );

  return (
    <div className="relative inline-flex items-center">
      <Select
        value={value}
        onChange={handleChange}
        disabled={isPending}
        className="h-9 w-48 appearance-none border-slate-300 bg-white pr-10 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-sm font-normal lowercase tracking-normal text-slate-700">
            {option.label}
          </option>
        ))}
      </Select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" aria-hidden />
    </div>
  );
}

export default TimeRangeSelect;
