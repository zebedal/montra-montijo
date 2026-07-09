import CategoryCard from "./CategoryCard";

type Category = {
  id: string;
  name: string;
  slug: string;
  businessCount: number;
};

type Props = {
  categories: Category[];
};

export default function CategoriesGrid({ categories }: Props) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category) => (
        <CategoryCard key={category.id} {...category} />
      ))}
    </div>
  );
}
