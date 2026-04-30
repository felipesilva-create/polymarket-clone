"use client";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", label: "Todas", icon: "🌍" },
  { id: "cidade", label: "Cidades", icon: "🏙️" },
  { id: "praia", label: "Praias", icon: "🏖️" },
  { id: "natureza", label: "Natureza", icon: "🌿" },
  { id: "espaco", label: "Espaco", icon: "🚀" },
];

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center gap-2 ${
            selectedCategory === category.id
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-amber-500/20"
              : "bg-[#141419] text-gray-400 border-[#252530] hover:border-amber-500/30 hover:text-white"
          }`}
        >
          <span>{category.icon}</span>
          {category.label}
        </button>
      ))}
    </div>
  );
}
