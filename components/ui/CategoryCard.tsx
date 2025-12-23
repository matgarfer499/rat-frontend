interface CategoryCardProps {
  id: number;
  name: string;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function CategoryCard({
  id,
  name,
  isSelected,
  onToggle,
  disabled = false,
}: CategoryCardProps) {
  return (
    <div className="relative group cursor-pointer">
      <input
        type="checkbox"
        id={`cat-${id}`}
        checked={isSelected}
        onChange={onToggle}
        disabled={disabled}
        className="peer sr-only"
      />
      <label
        htmlFor={`cat-${id}`}
        className={`flex flex-col h-full p-4 rounded-xl bg-white dark:bg-surface-dark border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all duration-200 ease-out shadow-sm hover:shadow-md ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex-1">
            {name}
          </h3>
          {/* Checkbox indicator */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-primary scale-100 opacity-100'
                : 'border-2 border-slate-200 dark:border-slate-600 bg-transparent scale-50 opacity-100 group-hover:border-primary/50'
            }`}
          >
            {isSelected && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}
