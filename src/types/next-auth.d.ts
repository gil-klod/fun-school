declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
    rememberMe?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      isAdmin?: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    rememberMe?: boolean;
  }
}

export { };
