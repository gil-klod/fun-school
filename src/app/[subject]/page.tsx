import { BackButton } from "@/components/BackButton";
import { GameCard } from "@/components/GameCard";
import { getSubject } from "@/lib/subjects";
import { notFound } from "next/navigation";

interface SubjectPageProps {
  params: Promise<{ subject: string }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject: subjectId } = await params;
  const subject = getSubject(subjectId);

  if (!subject) notFound();

  return (
    <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
      <BackButton href="/" label="Home" />

      <header className="text-center mb-8">
        <span className="text-6xl">{subject.emoji}</span>
        <h1 className="text-4xl font-bold text-gray-800 mt-2">{subject.title}</h1>
        <p className="text-2xl text-gray-600" dir="rtl">
          {subject.titleHe}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {subject.games.map((game) => (
          <GameCard key={game.id} game={game} color={subject.color} />
        ))}
      </div>
    </main>
  );
}
