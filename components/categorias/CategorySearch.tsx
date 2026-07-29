"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type CategorySearchProps = {
  value: string;
  onChange: (value: string) => void;
  prominent?: boolean;
};

export default function CategorySearch({
  value,
  onChange,
  prominent = false
}: CategorySearchProps) {
  return (
    <div className="relative">
      <Search
        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${prominent ? "left-4 size-5" : "left-3 h-4 w-4"}`}
      />

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pesquisar categoria..."
        className={
          prominent
            ? "h-14 rounded-2xl border-white/80 bg-white/95 pl-12 pr-4 text-base shadow-[0_14px_35px_rgba(72,55,35,0.1)] focus-visible:ring-emerald-700/25"
            : "pl-10"
        }
      />
    </div>
  );
}
