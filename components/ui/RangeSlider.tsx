'use client';

interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  unit?: string;
}

export function RangeSlider({ 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  label,
  unit = 'seg'
}: RangeSliderProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-3">
        <label className="text-slate-700 dark:text-slate-300 font-medium text-base">
          {label}
        </label>
        <span className="text-primary font-bold text-lg">{value} {unit}</span>
      </div>
      <div className="relative flex items-center h-6">
        <input 
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full z-10"
          style={{
            background: 'transparent',
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
