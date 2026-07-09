import CategoryListItem from "./CategoryListItem";

type Category = {
  id: string;
  name: string;
  slug: string;
  businessCount: number;
};

type Props = {
  categories: Category[];
};

export default function CategoriesList({ categories }: Props) {
  const grouped = categories.reduce(
    (acc, category) => {
      const letter = category.name[0].toUpperCase();

      if (!acc[letter]) {
        acc[letter] = [];
      }

      acc[letter].push(category);

      return acc;
    },
    {} as Record<string, Category[]>
  );

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([letter, values]) => (
        <div key={letter}>
          <h2 className="mb-3 text-lg font-bold">{letter}</h2>

          <div className="space-y-3">
            {values.map((category) => (
              <CategoryListItem key={category.id} {...category} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
