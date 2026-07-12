"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { ImagePickerBadge } from "@/components/ImagePicker";
import { validateImage, MAX_LOGO_SIZE_MB } from "@/lib/helpers";
import { toast } from "sonner";

type Props = {
  onChange: (file: File | null) => void;
  preview?: string | null;
  setPreview: (value: string | null) => void;
};

export function LogoUpload({ onChange, preview, setPreview }: Props) {
  const handleChange = (file: File | null) => {
    if (!file) return;

    const error = validateImage(file, MAX_LOGO_SIZE_MB);

    if (error) {
      toast.error(error, { position: "top-center" });
      return;
    }

    const url = URL.createObjectURL(file);

    onChange(file);
    setPreview(url);
  };

  const removeLogo = () => {
    onChange(null);
    setPreview(null);
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/0">
            <button
              type="button"
              onClick={removeLogo}
              className="absolute top-2 right-2 rounded-full bg-background/90 p-2 shadow backdrop-blur-sm transition-colors hover:bg-red-600 hover:text-white cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
