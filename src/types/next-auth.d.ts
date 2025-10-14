import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      provider?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    jwt: string; // JWT 속성을 필수로 변경
  }
  interface User {
    id: string;
    provider?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
} 