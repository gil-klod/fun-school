"use client";

import { useEffect, useState } from "react";
import { useStudent } from "@/components/students";
import { DailyProjectBanner } from "@/components/projects/DailyProjectBanner";
import type { DailyProjectPayload } from "@/lib/projects/types";

export function HomeDailyProject() {
  const { activeStudent, ready } = useStudent();
  const [project, setProject] = useState<DailyProjectPayload | null>(null);

  useEffect(() => {
    if (!ready || !activeStudent) {
      setProject(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/projects?studentId=${activeStudent.id}`);
        const data = await res.json();
        if (!cancelled && res.ok) setProject(data.project);
      } catch {
        if (!cancelled) setProject(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, activeStudent]);

  if (!activeStudent || !project || project.status === "completed") return null;

  return (
    <DailyProjectBanner
      project={project}
      studentName={activeStudent.name}
      englishSubjectId={activeStudent.englishSubjectId}
    />
  );
}
