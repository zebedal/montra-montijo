"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { ImagePickerBadge } from "@/components/ImagePicker";
import { validateImage, MAX_LOGO_SIZE_MB } from "@/lib/helpers";
import { toast } from "sonner";

type Props = {
  onChange: (file: File | null) => void;
};

export function LogoUpload({ onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (file: File | null) => {
    if (!file) return;

    const error = validateImage(file, MAX_LOGO_SIZE_MB);

    if (error) {
      toast.error(error, { position: "top-center" });
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    onChange(file);
  };

  const removeLogo = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <ImagePickerBadge label="Escolher logótipo" onChange={handleChange} />
      ) : (
        <div className="cursor-pointer group relative h-28 w-28 overflow-hidden rounded-md border">
          <Image
            src={preview}
            alt="Logo preview"
            width={112}
            height={112}
            className="h-full w-full object-cover"
          />

          {/* overlay hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/50">
            <button
              type="button"
              onClick={removeLogo}
              className="cursor-pointer rounded-full bg-white p-2 opacity-0 shadow transition-all duration-200 hover:bg-red-600 hover:text-white group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
