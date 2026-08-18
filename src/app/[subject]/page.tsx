import { getSubject } from "@/lib/subjects";
import { notFound } from "next/navigation";
import { SubjectPageContent } from "./SubjectPageContent";

interface SubjectPageProps {
  params: Promise<{ subject: string }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject: subjectId } = await params;
  const subject = getSubject(subjectId);

  if (!subject) notFound();

  return <SubjectPageContent subject={subject} />;
}
