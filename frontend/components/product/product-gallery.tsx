"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = React.useState(() => images[0] ?? "");

  if (!images.length) {
    return (
  <div className="flex aspect-4/3 w-full items-center justify-center rounded-2xl border border-border/80 bg-muted">
        <span className="text-sm text-muted-foreground">Media coming soon</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border/80">
        <Image
          src={activeImage}
          alt={`${name} preview`}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 600px, 100vw"
          priority
        />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image) => (
          <button
            type="button"
            key={image}
            onClick={() => setActiveImage(image)}
            className={cn(
              "flex h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition",
              activeImage === image
                ? "border-primary ring-2 ring-primary/60"
                : "border-border/60 hover:border-primary/50",
            )}
          >
            <Image
              src={image}
              alt={`${name} thumbnail`}
              width={112}
              height={80}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
