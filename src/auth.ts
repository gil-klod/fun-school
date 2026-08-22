import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ensureAdminFlag } from "@/lib/auth/adminEmails";
import { REQUIRE_EMAIL_VERIFICATION } from "@/lib/auth/emailVerification";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({ email: String(credentials.email).toLowerCase() });
        if (!user || (REQUIRE_EMAIL_VERIFICATION && !user.emailVerified)) return null;

        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!valid) return null;

        const isAdmin = await ensureAdminFlag(user);
        const rememberRaw = credentials.rememberMe;
        const rememberMe =
          rememberRaw === undefined ||
          rememberRaw === null ||
          String(rememberRaw) === "true" ||
          String(rememberRaw) === "1";

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isAdmin,
          rememberMe,
        };
      },
    }),
  ],
});
