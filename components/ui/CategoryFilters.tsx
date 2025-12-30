import { SearchIcon, CheckIcon, RandomIcon } from '@components/icons';
import { Input } from '@components/ui/Input';

interface CategoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectAll: () => void;
  onRandomToggle: () => void;
  allSelected: boolean;
  isRandomMode: boolean;
  disabled?: boolean;
  texts: {
    searchPlaceholder: string;
    selectAll: string;
    random: string;
    randomModeMessage: string;
  };
}

export function CategoryFilters({
  searchQuery,
  onSearchChange,
  onSelectAll,
  onRandomToggle,
  allSelected,
  isRandomMode,
  disabled = false,
  texts,
}: CategoryFiltersProps) {
  return (
    <>
      {/* Search Bar */}
      <div className="px-4 py-4 mt-2">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={disabled}
          icon={<SearchIcon size={24} />}
          placeholder={texts.searchPlaceholder}
        />
      </div>

      {/* Quick Action Chips */}
      <div className="flex gap-3 px-5 pb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={onSelectAll}
          disabled={isRandomMode || disabled}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full transition-colors pl-3 pr-4 active:scale-95 duration-100 ${
            allSelected && !isRandomMode
              ? 'bg-primary hover:bg-primary/90 text-white'
              : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm'
          } ${isRandomMode || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CheckIcon 
            size={20} 
            className={allSelected && !isRandomMode ? 'text-white' : 'text-slate-500 dark:text-gray-400'} 
          />
          <p className={`text-sm font-medium ${allSelected && !isRandomMode ? 'text-white' : 'text-slate-700 dark:text-gray-300'}`}>
            {texts.selectAll}
          </p>
        </button>
        
        <button
          onClick={onRandomToggle}
          disabled={disabled}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full transition-colors pl-3 pr-4 active:scale-95 duration-100 ${
            isRandomMode
              ? 'bg-primary hover:bg-primary/90 text-white'
              : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RandomIcon 
            size={20} 
            className={isRandomMode ? 'text-white' : 'text-slate-500 dark:text-gray-400'} 
          />
          <p className={`text-sm font-medium ${isRandomMode ? 'text-white' : 'text-slate-700 dark:text-gray-300'}`}>
            {texts.random}
          </p>
        </button>
      </div>
      
      {isRandomMode && (
        <div className="px-5 pb-4">
          <p className="text-sm text-primary dark:text-primary text-center">
            {texts.randomModeMessage}
          </p>
        </div>
      )}
    </>
  );
}
