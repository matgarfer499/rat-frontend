import { SearchIcon, CheckIcon, RandomIcon } from '@components/icons';

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
        <label className="flex flex-col h-12 w-full group">
          <div className="flex w-full flex-1 items-stretch rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm ring-1 ring-slate-200 dark:ring-transparent group-focus-within:ring-2 group-focus-within:ring-primary transition-all">
            <div className="flex items-center justify-center pl-4 text-slate-400 dark:text-slate-500">
              <SearchIcon size={24} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={disabled}
              className="flex w-full min-w-0 flex-1 bg-transparent px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-base font-normal h-full rounded-xl border-none focus:ring-0"
              placeholder={texts.searchPlaceholder}
            />
          </div>
        </label>
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
