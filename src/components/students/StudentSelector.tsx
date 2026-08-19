"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { getAvatarEmoji } from "@/lib/students/avatars";
import { useStudent } from "./StudentProvider";

export function StudentSelector({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  const { students, activeStudent, selectStudent, ready } = useStudent();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!ready || students.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xl border-2 border-indigo-100 bg-white hover:bg-indigo-50 transition-colors ${
          compact ? "px-2 py-1.5 text-sm" : "px-3 py-2"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-xl leading-none">{getAvatarEmoji(activeStudent?.avatar ?? "")}</span>
        {!compact && (
          <span className="font-semibold text-indigo-700 max-w-[7rem] truncate">
            {activeStudent?.name}
          </span>
        )}
        <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute top-full mt-1 end-0 min-w-[12rem] bg-white border-2 border-indigo-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden"
          role="listbox"
        >
          <li className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {t("students.select")}
          </li>
          {students.map((student) => (
            <li key={student.id}>
              <button
                type="button"
                role="option"
                aria-selected={student.id === activeStudent?.id}
                onClick={() => {
                  selectStudent(student.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-start hover:bg-indigo-50 transition-colors ${
                  student.id === activeStudent?.id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700"
                }`}
              >
                <span className="text-lg">{getAvatarEmoji(student.avatar)}</span>
                <span className="truncate">{student.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
