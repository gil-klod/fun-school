import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { importGameContent } from "@/lib/content/admin";

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  try {
    const raw = await request.json();
    const result = await importGameContent(raw);

    if (result.inserted === 0 && result.errors.length > 0) {
      return NextResponse.json(
        { ok: false, message: "Import failed.", ...result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Imported ${result.inserted} item(s).`,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
