import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { seedGameContent } from "@/lib/content/seed";

export async function POST() {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  try {
    const result = await seedGameContent(true);
    return NextResponse.json({ ok: true, message: "Default games loaded.", ...result });
  } catch (err) {
    console.error("Admin seed error:", err);
    return NextResponse.json({ error: "Failed to load default games" }, { status: 500 });
  }
}
