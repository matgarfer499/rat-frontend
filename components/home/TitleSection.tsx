import { useDictionary } from '@hooks/use-dictionary';

export function TitleSection() {
  const dict = useDictionary();

  if (!dict) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2 mb-8 px-6 text-center">
      <h1 className="text-white text-5xl md:text-6xl font-black tracking-tight leading-none drop-shadow-lg italic">
        {dict.lobby.title}
      </h1>
      <p className="text-white/90 text-lg font-bold tracking-widest uppercase">
        {dict.lobby.subtitle}
      </p>
      <p className="text-slate-500 text-xs md:text-sm font-medium mt-2 opacity-60">
        {dict.lobby.tagline.toUpperCase()}
      </p>
    </div>
  );
}
