"use client";

import Image from "next/image";
import { Trash2, Star } from "lucide-react";

type Props = {
  src: string;
  isPrimary?: boolean;
  onRemove: () => void;
  dragHandle?: React.ReactNode;
};

export function ImageCard({ src, isPrimary, onRemove, dragHandle }: Props) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border">
      <Image src={src} alt="" fill className="object-cover" />

      {isPrimary && (
        <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium shadow">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Principal
          </div>
        </div>
      )}

      {dragHandle}

      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 rounded-full bg-background/90 p-2 shadow backdrop-blur-sm transition-colors hover:bg-red-600 hover:text-white cursor-pointer"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}
