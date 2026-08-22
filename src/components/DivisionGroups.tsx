import { MathLtr } from "@/components/MathLtr";
import type { DivisionQuestion } from "@/lib/content/generators";

function ItemPile({ total, emoji }: { total: number; emoji: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-1 text-2xl sm:text-3xl" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i}>{emoji}</span>
      ))}
    </div>
  );
}

export function DivisionGroups({ question }: { question: DivisionQuestion }) {
  const { total, divisor, emoji, mode } = question;

  if (mode === "symbol") {
    return (
      <MathLtr className="text-4xl sm:text-5xl font-extrabold text-indigo-700">
        {total} ÷ {divisor} = ?
      </MathLtr>
    );
  }

  if (mode === "share") {
    return (
      <div className="space-y-5 w-full">
        <ItemPile total={total} emoji={emoji} />
        <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
          {Array.from({ length: divisor }, (_, g) => (
            <div
              key={g}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/80 px-3 py-2 min-w-[3.5rem]"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-lg font-bold text-amber-600">?</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <ItemPile total={total} emoji={emoji} />;
}
