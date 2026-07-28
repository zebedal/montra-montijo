import { Badge } from "@/components/ui/badge";

type Specialty = {
  id?: string;
  name: string;
  slug?: string;
};

type Props = {
  specialties?: Specialty[];
  limit?: number;
  className?: string;
};

export function BusinessSpecialtyChips({
  specialties = [],
  limit = 2,
  className
}: Props) {
  if (specialties.length === 0) return null;

  const visible = specialties.slice(0, limit);
  const remaining = specialties.length - visible.length;

  return (
    <div className={className ?? "mt-3 flex flex-wrap gap-1.5"}>
      {visible.map((specialty) => (
        <Badge
          key={specialty.id ?? specialty.slug ?? specialty.name}
          variant="secondary"
          className="max-w-full truncate font-normal"
        >
          {specialty.name}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="font-normal">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}
