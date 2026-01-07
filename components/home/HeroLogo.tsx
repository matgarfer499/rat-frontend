import { RatIcon } from '@components/icons';

export function HeroLogo() {
  return (
    <div className="relative w-full max-w-[320px] aspect-square mb-6 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full" />
      <div className="relative w-64 h-64 flex items-center justify-center scale-110">
        <RatIcon size={550} className="scale-110" />
      </div>
    </div>
  );
}
