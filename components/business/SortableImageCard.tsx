import { useSortable } from "@dnd-kit/react/sortable";

import { ImageCard } from "./ImageCard";
import { UploadImage } from "@/types/upload-image";
import { GripVertical } from "lucide-react";

type Props = {
  image: UploadImage;
  index: number;
  isPrimary: boolean;
  onRemove: () => void;
};

export function SortableImageCard({
  image,
  index,
  isPrimary,
  onRemove
}: Props) {
  const { ref, handleRef } = useSortable({
    id: image.id,
    index
  });

  return (
    <div ref={ref}>
      <ImageCard
        src={image.preview ?? ""}
        isPrimary={isPrimary}
        onRemove={onRemove}
        dragHandle={
          <button
            type="button"
            className="absolute bottom-2 left-2 rounded-full bg-background/90 p-2 shadow backdrop-blur-sm"
            ref={handleRef}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        }
      />
    </div>
  );
}
