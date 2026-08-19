"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import type { UserGender } from "@/lib/gender";

export interface StudentProfile {
  id: string;
  name: string;
  age: number;
  gender: UserGender;
  avatar: string;
}

interface CreateStudentInput {
  name: string;
  age: number;
  gender: UserGender;
  avatar: string;
}

interface StudentContextValue {
  ready: boolean;
  students: StudentProfile[];
  activeStudent: StudentProfile | null;
  needsStudent: boolean;
  selectStudent: (id: string) => void;
  createStudent: (input: CreateStudentInput) => Promise<StudentProfile>;
  deleteStudent: (id: string) => Promise<void>;
  refreshStudents: () => Promise<void>;
}

const StudentContext = createContext<StudentContextValue | null>(null);

function storageKey(userId: string) {
  return `fun-school-active-student-${userId}`;
}

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!userId) {
      setStudents([]);
      setActiveId(null);
      setReady(true);
      return;
    }

    try {
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error("Failed to load students");
      const data = (await res.json()) as { students: StudentProfile[] };
      setStudents(data.students);

      const stored = localStorage.getItem(storageKey(userId));
      const validStored = data.students.find((s) => s.id === stored);
      if (validStored) {
        setActiveId(validStored.id);
      } else if (data.students[0]) {
        setActiveId(data.students[0].id);
        localStorage.setItem(storageKey(userId), data.students[0].id);
      } else {
        setActiveId(null);
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
      setActiveId(null);
    } finally {
      setReady(true);
    }
  }, [userId]);

  useEffect(() => {
    if (status === "loading") return;
    setReady(false);
    loadStudents();
  }, [status, loadStudents]);

  const selectStudent = useCallback(
    (id: string) => {
      if (!userId) return;
      setActiveId(id);
      localStorage.setItem(storageKey(userId), id);
    },
    [userId]
  );

  const createStudent = useCallback(
    async (input: CreateStudentInput) => {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create student");

      const student = data.student as StudentProfile;
      setStudents((prev) => [...prev, student]);
      selectStudent(student.id);
      return student;
    },
    [selectStudent]
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete student");
      }

      setStudents((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (userId) {
          if (activeId === id) {
            const replacement = next[0]?.id ?? null;
            setActiveId(replacement);
            if (replacement) localStorage.setItem(storageKey(userId), replacement);
            else localStorage.removeItem(storageKey(userId));
          }
        }
        return next;
      });
    },
    [activeId, userId]
  );

  const activeStudent = useMemo(
    () => students.find((s) => s.id === activeId) ?? null,
    [students, activeId]
  );

  const needsStudent = !!userId && ready && students.length === 0;

  const value = useMemo<StudentContextValue>(
    () => ({
      ready,
      students,
      activeStudent,
      needsStudent,
      selectStudent,
      createStudent,
      deleteStudent,
      refreshStudents: loadStudents,
    }),
    [
      ready,
      students,
      activeStudent,
      needsStudent,
      selectStudent,
      createStudent,
      deleteStudent,
      loadStudents,
    ]
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within StudentProvider");
  return ctx;
}

export function useOptionalStudent() {
  return useContext(StudentContext);
}
