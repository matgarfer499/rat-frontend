'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { fetchCategories } from '@lib/api';
import { CategoryWithTranslations } from '@lib/types';
import { useDictionary } from '@hooks/use-dictionary';
import { ArrowLeftIcon, AlertIcon, PlayIcon } from '@components/icons';
import { CategoryCard, CategoryFilters, ActionButton } from '@components/ui';

export default function CategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  const [categories, setCategories] = useState<CategoryWithTranslations[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRandomMode, setIsRandomMode] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => {
        console.error(err);
        setError('Failed to load categories');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStartGame = () => {
    // En modo aleatorio siempre hay categorías seleccionadas
    if (!isRandomMode && selectedCategories.length === 0) {
      return;
    }

    sessionStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    router.push(`/${lang}/reveal`);
  };

  const handleBack = () => {
    router.push(`/${lang}/setup`);
  };

  const handleSelectAll = () => {
    if (isRandomMode) return; // No permitir en modo aleatorio
    
    const allIds = filteredCategories.map((cat) => cat.id);
    const allSelected = allIds.every((id) => selectedCategories.includes(id));
    
    if (allSelected) {
      // Deseleccionar todo
      setSelectedCategories([]);
    } else {
      // Seleccionar todo
      setSelectedCategories(allIds);
    }
  };

  const handleRandomSelection = () => {
    if (isRandomMode) {
      // Desactivar modo aleatorio
      setIsRandomMode(false);
      setSelectedCategories([]);
      return;
    }
    
    const availableCategories = categories; // Usar todas, no filtradas
    if (availableCategories.length === 0) return;
    
    // Select 3-5 random categories
    const count = Math.min(
      Math.floor(Math.random() * 3) + 3,
      availableCategories.length
    );
    
    const shuffled = [...availableCategories].sort(() => Math.random() - 0.5);
    const randomIds = shuffled.slice(0, count).map((cat) => cat.id);
    
    // Activar modo aleatorio y seleccionar en secreto
    setIsRandomMode(true);
    setSelectedCategories(randomIds);
    setSearchQuery(''); // Limpiar búsqueda
  };

  const toggleCategory = (categoryId: number) => {
    if (isRandomMode) return; // No permitir cambios en modo aleatorio
    
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) => {
    const translation = category.translations.find((t) => t.language === lang);
    const name = translation?.name || category.translations[0]?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Check if all visible categories are selected
  const allSelected = filteredCategories.length > 0 && 
    filteredCategories.every((cat) => selectedCategories.includes(cat.id));

  if (!dict) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl animate-pulse" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-4">
          <AlertIcon size={32} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{dict.categories.error}</h2>
        <p className="text-slate-500 dark:text-gray-400 mb-6">{dict.categories.errorRetry}</p>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-full font-bold transition-all active:scale-95"
        >
          {dict.setup.back}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex min-h-screen w-full flex-col pb-32"
    >
      {/* Top App Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={handleBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          {dict.categories.title}
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col">
        {/* Headline Text */}
        <div className="px-5 pt-2">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight mb-2">
            {dict.categories.selectCategories}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-base font-normal leading-normal">
            {dict.categories.subtitle}
          </p>
        </div>

        {/* Filters */}
        <CategoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectAll={handleSelectAll}
          onRandomToggle={handleRandomSelection}
          allSelected={allSelected}
          isRandomMode={isRandomMode}
          texts={{
            searchPlaceholder: dict.categories.searchPlaceholder,
            selectAll: dict.categories.selectAll,
            random: dict.categories.random,
            randomModeMessage: dict.categories.randomMode,
          }}
        />

        {/* Category Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500 dark:text-gray-400 text-lg animate-pulse">
              {dict.categories.loading}
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex items-center justify-center py-12 px-4">
            <p className="text-slate-500 dark:text-gray-400 text-center">
              {searchQuery
                ? 'No se encontraron categorías'
                : dict.categories.noCategories}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 mt-2">
            {filteredCategories.map((category) => {
              const translation = category.translations.find(
                (t) => t.language === lang
              );
              const name =
                translation?.name || category.translations[0]?.name || '';
              const isSelected = isRandomMode ? false : selectedCategories.includes(category.id);

              return (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={name}
                  isSelected={isSelected}
                  onToggle={() => toggleCategory(category.id)}
                  disabled={isRandomMode}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Footer FAB */}
      <div className="fixed bottom-0 left-0 w-full z-40 px-6 pb-6 pt-12 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/90 dark:via-background-dark/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <ActionButton
            onClick={handleStartGame}
            variant="primary"
            icon={<PlayIcon size={20} />}
            className={!isRandomMode && selectedCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {dict.categories.continue}
          </ActionButton>
        </div>
      </div>
    </motion.div>
  );
}
