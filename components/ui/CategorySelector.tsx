'use client';

import { motion } from 'framer-motion';
import { CategoryCard } from './CategoryCard';
import { CategorySkeletonGrid } from './CategorySkeleton';

interface Category {
  id: number;
  key: string;
  translations?: Array<{
    language: string;
    name: string;
  }>;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategories: number[];
  onSelectionChange: (categories: number[]) => void;
  loading?: boolean;
  language: string;
  texts?: {
    loading?: string;
    noCategories?: string;
    selectedSingular?: string;
    selectedPlural?: string;
  };
}

export function CategorySelector({
  categories,
  selectedCategories,
  onSelectionChange,
  loading = false,
  language,
  texts = {},
}: CategorySelectorProps) {
  const {
    loading: loadingText = 'Loading...',
    noCategories = 'No categories available',
    selectedSingular = '1 category selected',
    selectedPlural = '{count} categories selected',
  } = texts;

  const toggleCategory = (categoryId: number) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onSelectionChange(newSelection);
  };

  const getCategoryName = (category: Category): string => {
    const translation = category.translations?.find((t) => t.language === language);
    return translation?.name || category.key;
  };

  const getSelectedText = (): string => {
    const count = selectedCategories.length;
    if (count === 0) return '';
    if (count === 1) return selectedSingular;
    return selectedPlural.replace('{count}', String(count));
  };

  if (loading) {
    return <CategorySkeletonGrid count={6} />;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-muted">{noCategories}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <CategoryCard
              id={category.id}
              name={getCategoryName(category)}
              isSelected={selectedCategories.includes(category.id)}
              onToggle={() => toggleCategory(category.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Selected count */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: selectedCategories.length > 0 ? 1 : 0,
          height: selectedCategories.length > 0 ? 'auto' : 0,
        }}
        className="text-center overflow-hidden"
      >
        <span className="text-purple-light font-medium">
          {getSelectedText()}
        </span>
      </motion.div>
    </div>
  );
}
