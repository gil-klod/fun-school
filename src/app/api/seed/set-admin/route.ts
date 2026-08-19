import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

/** One-shot admin promotion — protected by SEED_SECRET (same as POST /api/seed). */
export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email } = await request.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { email: String(email).toLowerCase().trim() },
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    console.error("Set admin error:", err);
    return NextResponse.json({ error: "Failed to set admin" }, { status: 500 });
  }
}
