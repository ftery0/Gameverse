import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { connectDB } from "@/libs/mongodb/mongodb";
import { User } from "@/models/user";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        id: { label: "아이디", type: "text" },
        name: { label: "이름", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const { id, password } = credentials!;

        await connectDB();
        const user = await User.findOne({ id, provider: "credentials" });

        if (user && user.password === password) {
          return { id: user.id, name: user.name };
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account }) {
      await connectDB();

      const existingUser = await User.findOne({ id: user.id });

      if (!existingUser) {
        await new User({
          id: user.id,
          name: user.name || '소셜 유저',
          provider: account?.provider || 'credentials',
          image: user.image || null, 
        }).save();
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET as string,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
