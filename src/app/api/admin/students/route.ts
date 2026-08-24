import { NextResponse } from "next/server";
import { getAdminStudentStats } from "@/lib/admin/studentStats";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  try {
    const { searchParams } = new URL(request.url);
    const daysParam = Number(searchParams.get("days") ?? "7");
    const activeDays = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(daysParam, 90) : 7;
    const data = await getAdminStudentStats(activeDays);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Admin students stats error:", err);
    return NextResponse.json({ error: "Failed to load student stats" }, { status: 500 });
  }
}
