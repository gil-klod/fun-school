import { SubjectCard } from "@/components/SubjectCard";
import { ContinueBanner } from "@/components/ContinueBanner";
import { subjects } from "@/lib/subjects";

export default function HomePage() {
  return (
    <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 animate-bounce-in">
        <h1 className="text-5xl font-extrabold text-indigo-700 mb-2">
          Fun School 🎒
        </h1>
        <p className="text-xl text-gray-600" dir="rtl">
          בית ספר כיפי — משחקים לכיתה ג&apos;
        </p>
        <p className="text-lg text-gray-500 mt-2">
          Pick a subject and start playing!
        </p>
      </header>

      <ContinueBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>

      <footer className="text-center mt-12 text-gray-400 text-sm">
        Made with ❤️ for 3rd grade
      </footer>
    </main>
  );
}
