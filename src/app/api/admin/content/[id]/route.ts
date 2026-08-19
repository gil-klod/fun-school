import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { connectDB } from "@/lib/db";
import { GameContent } from "@/models/GameContent";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  const { id } = await params;
  await connectDB();
  const deleted = await GameContent.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
