"use client";

import Image from "next/image";
import { Trash2, Star } from "lucide-react";

type Props = {
  src: string;
  isPrimary?: boolean;
  onRemove: () => void;
};

export function ImageCard({ src, isPrimary, onRemove }: Props) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border cursor-pointer">
      <Image src={src} alt="" fill className="object-cover" />

      {isPrimary && (
        <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium shadow">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Principal
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/50">
        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer rounded-full bg-white p-2 opacity-0 transition-all duration-200 hover:bg-red-600 hover:text-white group-hover:opacity-100"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
