import type { UserGender } from "@/lib/gender";

declare module "next-auth" {
  interface User {
    gender?: UserGender;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      gender?: UserGender;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    gender?: UserGender;
  }
}

export { };
