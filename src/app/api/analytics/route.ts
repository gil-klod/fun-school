import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { UserAnalytics } from "@/models/UserAnalytics";
import { computeAnalytics } from "@/lib/analytics";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  let analytics = await UserAnalytics.findOne({ userId: session.user.id });
  if (!analytics) {
    analytics = await computeAnalytics(session.user.id);
  }

  return NextResponse.json({ analytics });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const analytics = await computeAnalytics(session.user.id);
  return NextResponse.json({ analytics });
}
