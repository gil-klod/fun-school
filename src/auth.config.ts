import type { NextAuthConfig } from "next-auth";
import { decode, encode } from "@auth/core/jwt";

const THIRTY_DAYS = 30 * 24 * 60 * 60;
const ONE_DAY = 24 * 60 * 60;

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: THIRTY_DAYS,
  },
  jwt: {
    maxAge: THIRTY_DAYS,
    async encode(params) {
      const remember = params.token?.rememberMe !== false;
      const maxAge = remember ? THIRTY_DAYS : ONE_DAY;
      return encode({ ...params, maxAge });
    },
    decode,
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.rememberMe = user.rememberMe !== false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.isAdmin = !!token.isAdmin;
      }
      return session;
    },
  },
};
