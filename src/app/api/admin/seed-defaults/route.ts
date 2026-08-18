import { NextResponse } from "next/server";
import { seedGameContent } from "@/lib/content/seed";

export async function POST() {
  try {
    const result = await seedGameContent(true);
    return NextResponse.json({ ok: true, message: "Default games loaded.", ...result });
  } catch (err) {
    console.error("Admin seed error:", err);
    return NextResponse.json({ error: "Failed to load default games" }, { status: 500 });
  }
}
