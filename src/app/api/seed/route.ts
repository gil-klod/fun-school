import { NextResponse } from "next/server";
import { seedGameContent } from "@/lib/content/seed";

export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await seedGameContent(true);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
