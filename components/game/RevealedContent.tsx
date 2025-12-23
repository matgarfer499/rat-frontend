import { PlayerRole } from '@lib/types';

interface RevealedContentProps {
  role: PlayerRole;
  roleLabel: string;
  word?: string;
  roleColor: string;
  yourRoleLabel: string;
  yourWordLabel: string;
  dontKnowWordLabel: string;
  detectiveHint?: string;
  jokerHint?: string;
}

export function RevealedContent({
  role,
  roleLabel,
  word,
  roleColor,
  yourRoleLabel,
  yourWordLabel,
  dontKnowWordLabel,
  detectiveHint,
  jokerHint,
}: RevealedContentProps) {
  return (
    <div className="absolute inset-0 flex flex-col rounded-[2.5rem] overflow-hidden shadow-card border border-white/10 bg-[#151e32] p-8">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Role */}
        <div className="text-center">
          <p className="text-white/60 text-sm mb-2">{yourRoleLabel}</p>
          <h2 className={`text-4xl font-black tracking-tight ${roleColor}`}>
            {roleLabel}
          </h2>
        </div>

        {/* Word or hint */}
        {word ? (
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">{yourWordLabel}</p>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl px-8 py-4 border border-white/10">
              <p className={`text-3xl font-bold tracking-wide ${roleColor}`}>
                {word}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-red-400 text-sm text-center px-4">
            {dontKnowWordLabel}
          </p>
        )}

        {/* Special role hints */}
        {role === 'detective' && detectiveHint && (
          <p className="text-blue-300 text-xs text-center px-6">
            {detectiveHint}
          </p>
        )}
        {role === 'joker' && jokerHint && (
          <p className="text-orange-300 text-xs text-center px-6">
            {jokerHint}
          </p>
        )}
      </div>
    </div>
  );
}
