"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  label?: string;
  onChange: (file: File | null) => void;
  className?: string;
};

export function ImagePickerBadge({
  label = "Escolher imagem",
  onChange,
  className
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    onChange(file);

    // permite selecionar novamente o mesmo ficheiro
    e.target.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 ", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {/* BUTTON (hidden when preview exists) */}
      {!preview && (
        <button
          type="button"
          onClick={handlePick}
          className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted transition w-fit cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          {label}
        </button>
      )}
      {/* PREVIEW */}
      {preview && (
        <div className="group relative h-24 w-24 overflow-hidden rounded-md border cursor-pointer">
          <Image
            src={preview}
            className="w-24 h-24 object-cover rounded-md border"
            alt="Preview"
            width={96}
            height={96}
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/50">
            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer rounded-full bg-white/90 p-2 opacity-0 shadow transition-all duration-200 hover:bg-red-600 hover:text-white group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
