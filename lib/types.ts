// API Types
export interface Category {
  id: number;
  key: string;
}

export interface CategoryTranslation {
  id: number;
  category_id: number;
  language: string;
  name: string;
}

export interface CategoryWithTranslations extends Category {
  translations: CategoryTranslation[];
}

export interface Word {
  id: number;
  key: string;
  category_id: number;
}

export interface WordTranslation {
  id: number;
  word_id: number;
  language: string;
  value: string;
}

export interface WordWithTranslations extends Word {
  translations: WordTranslation[];
}

// Game Types
export type PlayerRole = 'civilian' | 'impostor' | 'detective' | 'joker';

export interface Player {
  id: string;
  name: string;
  role?: PlayerRole;
  word?: string;
  hasSeenRole: boolean;
  detectiveUsed?: boolean; // For detective role tracking
}

export interface GameRoles {
  detectiveEnabled: boolean;
  jokerEnabled: boolean;
}

export interface GameConfig {
  language: string;
  players: Player[];
  selectedCategories: number[];
  roles?: GameRoles;
}