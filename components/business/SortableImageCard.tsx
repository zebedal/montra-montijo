import { useSortable } from "@dnd-kit/react/sortable";

import { ImageCard } from "./ImageCard";
import { UploadImage } from "@/types/upload-image";

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
  const { ref } = useSortable({
    id: image.id,
    index
  });

  return (
    <div ref={ref}>
      <ImageCard
        src={image.preview ?? ""}
        isPrimary={isPrimary}
        onRemove={onRemove}
      />
    </div>
  );
}
