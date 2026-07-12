"use client";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { isSortable } from "@dnd-kit/react/sortable";
import { validateImage, MAX_IMAGE_SIZE_MB } from "@/lib/helpers";
import { toast } from "sonner";
import { UploadImage } from "@/types/upload-image";
import { SortableImageCard } from "./SortableImageCard";

const MAX_IMAGES = 6;

type Props = {
  images: UploadImage[];
  onChange: (images: UploadImage[]) => void;
};

export function BusinessImagesUpload({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pickImages = () => {
    inputRef.current?.click();
  };

  const handleFiles = (files: FileList) => {
    const current = [...images];

    Array.from(files).forEach((file) => {
      if (current.length >= MAX_IMAGES) return;

      const error = validateImage(file, MAX_IMAGE_SIZE_MB);

      if (error) {
        toast.error(error, { position: "top-center" });
        return;
      }

      current.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file)
      });
    });

    onChange(current);
  };

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    onChange(updated);
  };

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const { source } = event.operation;

        if (!isSortable(source)) return;

        onChange(move(images, event));
      }}
    >
      <div className="space-y-4">
        <input
          ref={inputRef}
          hidden
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={pickImages}
              className="cursor-pointer flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed transition hover:border-primary hover:bg-muted/40"
            >
              <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />

              <span className="text-sm font-medium">Adicionar fotografias</span>

              <span className="mt-1 text-xs text-muted-foreground">
                Máximo {MAX_IMAGES}
              </span>
            </button>
          )}

          {images.map((image, index) => (
            <SortableImageCard
              key={image.id}
              image={image}
              index={index}
              isPrimary={index === 0}
              onRemove={() => removeImage(image.id)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {images.length} de {MAX_IMAGES} fotografias
          </span>

          {images.length > 0 && (
            <span>A primeira fotografia será a principal.</span>
          )}
        </div>
      </div>
    </DragDropProvider>
  );
}
