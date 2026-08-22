import { MathLtr } from "@/components/MathLtr";
import type { DivisionQuestion } from "@/lib/content/generators";

const FRIEND_EMOJIS = ["👦", "👧", "🧒", "👶"];

function ItemPile({ total, emoji }: { total: number; emoji: string }) {
  const show = Math.min(total, 18);
  const extra = total - show;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex flex-wrap justify-center gap-1 text-2xl sm:text-3xl max-w-[14rem]" aria-hidden>
        {Array.from({ length: show }, (_, i) => (
          <span key={i}>{emoji}</span>
        ))}
      </div>
      {extra > 0 ? (
        <p className="text-sm font-semibold text-amber-700">
          +{extra} <span aria-hidden>{emoji}</span>
        </p>
      ) : null}
    </div>
  );
}

export function DivisionGroups({ question }: { question: DivisionQuestion }) {
  const { total, divisor, emoji, mode } = question;

  if (mode === "symbol") {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl" aria-hidden>
          {emoji}
        </span>
        <MathLtr className="text-4xl sm:text-5xl font-extrabold text-indigo-700">
          {total} ÷ {divisor} = ?
        </MathLtr>
      </div>
    );
  }

  if (mode === "share") {
    return (
      <div className="space-y-4 w-full">
        <ItemPile total={total} emoji={emoji} />
        <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
          {Array.from({ length: divisor }, (_, g) => (
            <div
              key={g}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/80 px-3 py-2 min-w-[4rem]"
            >
              <span className="text-2xl" aria-hidden>
                {FRIEND_EMOJIS[g % FRIEND_EMOJIS.length]}
              </span>
              <span className="text-xl" aria-hidden>
                {emoji}
              </span>
              <span className="text-lg font-bold text-amber-600">?</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <ItemPile total={total} emoji={emoji} />
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/80 px-4 py-3 flex gap-1">
          {Array.from({ length: Math.min(divisor, 8) }, (_, i) => (
            <span key={i} className="text-xl" aria-hidden>
              {emoji}
            </span>
          ))}
        </div>
        <span className="text-2xl font-bold text-indigo-500">× ?</span>
      </div>
    </div>
  );
}
