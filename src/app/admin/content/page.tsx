"use client";

import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { subjects } from "@/lib/subjects";
import { useEffect, useState } from "react";

interface GameStat {
  subjectId: string;
  gameId: string;
  count: number;
}

export default function AdminContentPage() {
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, number> = {};
        for (const g of (data.stats?.games ?? []) as GameStat[]) {
          map[`${g.subjectId}/${g.gameId}`] = g.count;
        }
        setStats(map);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
      <AdminNav />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Game content</h1>
      <p className="text-gray-500 text-sm mb-8">
        Pick a game to view, edit, upload, and preview its questions & data.
      </p>

      <div className="space-y-6">
        {subjects.map((subject) => (
          <section
            key={subject.id}
            className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              {subject.emoji} {subject.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subject.games.map((game) => {
                const count = stats[`${subject.id}/${game.id}`] ?? 0;
                return (
                  <Link
                    key={game.id}
                    href={`/admin/content/${subject.id}/${game.id}`}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-indigo-50 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                  >
                    <span className="text-2xl">{game.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 truncate">{game.title}</p>
                      <p className="text-xs text-gray-500">{count} items in DB</p>
                    </div>
                    <span className="text-indigo-500 font-bold">Edit →</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
