import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { VerificationToken } from "@/models/VerificationToken";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await connectDB();

    const verification = await VerificationToken.findOne({ token });
    if (!verification || verification.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await User.findByIdAndUpdate(verification.userId, { emailVerified: new Date() });
    await VerificationToken.deleteOne({ _id: verification._id });

    return NextResponse.json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
