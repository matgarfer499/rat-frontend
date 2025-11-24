'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCategories } from '@/lib/api';
import { CategoryWithTranslations } from '@/lib/types';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithTranslations[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lang = sessionStorage.getItem('gameLanguage') || 'en';
    setLanguage(lang);

    fetchCategories()
      .then(setCategories)
      .catch((err) => {
        console.error(err);
        setError('Failed to load categories. Make sure the API is running.');
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
    const translation = category.translations.find((t) => t.language === language);
    return translation?.name || category.key;
  };

  const handleStartGame = () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    sessionStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    router.push('/reveal');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-center text-white">
          <div className="mb-4 text-4xl">⏳</div>
          <div className="text-xl font-semibold">Loading categories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Select Categories</h1>
          <p className="mt-2 text-gray-600">
            Choose one or more categories for the game
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-lg bg-yellow-50 p-6 text-center">
            <p className="text-yellow-800">
              No categories available. Please add categories in the API first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  selectedCategories.includes(category.id)
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getCategoryName(category)}
                    </h3>
                    <p className="text-sm text-gray-500">{category.key}</p>
                  </div>
                  {selectedCategories.includes(category.id) && (
                    <div className="text-2xl">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedCategories.length > 0 && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>{selectedCategories.length}</strong> categor
              {selectedCategories.length === 1 ? 'y' : 'ies'} selected
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => router.back()}
            className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleStartGame}
            disabled={selectedCategories.length === 0}
            className={`flex-1 rounded-lg px-6 py-3 font-semibold text-white transition-all ${
              selectedCategories.length === 0
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
            }`}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
