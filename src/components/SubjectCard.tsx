import Link from "next/link";
import type { SubjectInfo } from "@/lib/types";

interface SubjectCardProps {
  subject: SubjectInfo;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Link
      href={subject.href}
      className={`group block rounded-3xl border-4 ${subject.borderColor} ${subject.color} p-6 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300`}
    >
      <div className="text-5xl mb-3 group-hover:animate-pop">{subject.emoji}</div>
      <h2 className="text-2xl font-bold text-gray-800">{subject.title}</h2>
      <p className="text-lg text-gray-600 mt-1" dir="rtl">
        {subject.titleHe}
      </p>
      <p className="text-sm text-gray-500 mt-3">
        {subject.games.length} games →
      </p>
    </Link>
  );
}
