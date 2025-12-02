'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { fetchCategories } from '@lib/api';
import { CategoryWithTranslations } from '@lib/types';
import { useDictionary } from '@hooks/use-dictionary';
import { LanguageSelector } from '@components/layout/LanguageSelector';
import { StepIndicator, Card, CategoryCard, CategorySkeletonGrid } from '@components/ui';
import { Button } from '@components/button';
import { FolderIcon, ArrowLeftIcon, AlertIcon } from '@components/icons';

export default function CategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  const [categories, setCategories] = useState<CategoryWithTranslations[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => {
        console.error(err);
        setError('Failed to load categories');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryName = (category: CategoryWithTranslations): string => {
    const translation = category.translations.find((t) => t.language === lang);
    return translation?.name || category.key;
  };

  const handleStartGame = () => {
    if (selectedCategories.length === 0) {
      return;
    }

    sessionStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    router.push(`/${lang}/reveal`);
  };

  const handleBack = () => {
    router.push(`/${lang}/setup`);
  };

  const getSelectedText = (): string => {
    if (!dict) return '';
    const count = selectedCategories.length;
    if (count === 0) return '';
    if (count === 1) return dict.categories.selectedSingular;
    return dict.categories.selectedPlural.replace('{count}', String(count));
  };

  if (!dict) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-purple-light text-xl animate-pulse" />
      </div>
    );
  }

  const steps = [
    { label: dict.setup.stepSetup, isCompleted: true, isCurrent: false },
    { label: dict.setup.stepCategories, isCompleted: false, isCurrent: true },
  ];

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center px-4 py-6 sm:py-8">
        <header className="w-full max-w-lg flex justify-end mb-6">
          <LanguageSelector />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg">
          <Card variant="solid" className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
              <AlertIcon size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{dict.categories.error}</h2>
            <p className="text-gray-muted mb-6">{dict.categories.errorRetry}</p>
            <Button variant="primary" onClick={handleBack}>
              {dict.common.back}
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex min-h-screen flex-col items-center px-4 py-6 sm:py-8"
    >
      {/* Header with language selector */}
      <header className="w-full max-w-lg flex justify-end mb-6">
        <LanguageSelector />
      </header>

      <main className="flex-1 flex flex-col w-full max-w-lg">
        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator steps={steps} />
        </div>

        {/* Title section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-base/20 border border-purple-base/40 flex items-center justify-center">
            <FolderIcon size={24} className="text-purple-light" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{dict.categories.title}</h1>
            <p className="text-sm text-gray-muted">{dict.categories.subtitle}</p>
          </div>
        </div>

        {/* Categories grid */}
        <Card variant="solid" className="p-4 flex-1">
          {loading ? (
            <CategorySkeletonGrid count={6} />
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-muted">{dict.categories.noCategories}</p>
            </div>
          ) : (
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
                    name={getCategoryName(category)}
                    isSelected={selectedCategories.includes(category.id)}
                    onClick={() => toggleCategory(category.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </Card>

        {/* Selected count */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: selectedCategories.length > 0 ? 1 : 0,
            height: selectedCategories.length > 0 ? 'auto' : 0,
          }}
          className="mt-4 text-center overflow-hidden"
        >
          <span className="text-purple-light font-medium">
            {getSelectedText()}
          </span>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon size={20} />
            {dict.common.back}
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartGame}
            disabled={selectedCategories.length === 0}
            className="flex-1"
          >
            {dict.categories.continue}
          </Button>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="h-8" />
    </motion.div>
  );
}
