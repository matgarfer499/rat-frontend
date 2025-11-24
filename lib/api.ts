import { CategoryWithTranslations, WordWithTranslations } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchCategories(): Promise<CategoryWithTranslations[]> {
  const response = await fetch(`${API_BASE_URL}/categories/`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  const categories = await response.json();
  
  // Fetch translations for each category
  const categoriesWithTranslations = await Promise.all(
    categories.map(async (category: { id: number }) => {
      const translationsResponse = await fetch(
        `${API_BASE_URL}/categories/${category.id}/translations`
      );
      const translations = await translationsResponse.json();
      return { ...category, translations };
    })
  );
  
  return categoriesWithTranslations;
}

export async function fetchWordsByCategory(categoryId: number): Promise<WordWithTranslations[]> {
  const response = await fetch(`${API_BASE_URL}/words/?category_id=${categoryId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch words');
  }
  
  const words = await response.json();
  
  // Fetch translations for each word
  const wordsWithTranslations = await Promise.all(
    words.map(async (word: { id: number }) => {
      const translationsResponse = await fetch(
        `${API_BASE_URL}/words/${word.id}/translations`
      );
      const translations = await translationsResponse.json();
      return { ...word, translations };
    })
  );
  
  return wordsWithTranslations;
}

export async function getRandomWord(
  categoryIds: number[],
  language: string
): Promise<{ word: string; categoryId: number } | null> {
  // Pick a random category
  const randomCategoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
  
  // Fetch words from that category
  const words = await fetchWordsByCategory(randomCategoryId);
  
  if (words.length === 0) return null;
  
  // Pick a random word
  const randomWord = words[Math.floor(Math.random() * words.length)];
  
  // Get translation in the selected language
  const translation = randomWord.translations.find(t => t.language === language);
  
  if (!translation) return null;
  
  return {
    word: translation.value,
    categoryId: randomCategoryId
  };
}
