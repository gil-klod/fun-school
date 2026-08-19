import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getContentStats } from "@/lib/content/admin";

export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  try {
    const stats = await getContentStats();
    return NextResponse.json({ stats });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
