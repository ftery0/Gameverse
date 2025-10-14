import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { connectDB } from "@/libs/connectDB";
import { User } from "@/models/user";
import jwt from 'jsonwebtoken';

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
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const { id, password } = credentials!;

        await connectDB();
        const user = await User.findOne({ id, provider: "credentials" });

        if (user && user.password === password) {
          // JWT 토큰 생성
          // const jwtToken = jwt.sign(
          //   { id: user.id, name: user.name, provider: user.provider },
          //   process.env.NEXTAUTH_SECRET as string,
          //   { expiresIn: '1h' } // 토큰 유효 기간 1시간
          // );
          return { id: user.id, name: user.name, provider: "credentials" };
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
    async jwt({ token, user, account }) {
      console.log('JWT Callback - before update:', token);
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email; // NextAuth user 객체에 email이 있을 수 있음
        token.provider = account?.provider || user.provider; // user.provider는 credentials에서 옴
      }

      // token 객체의 현재 페이로드를 사용하여 새로운 JWT 토큰 생성
      const signedToken = jwt.sign(
        {
          id: token.id,
          name: token.name,
          email: token.email || undefined, // email이 없을 수도 있으므로 undefined 처리
          provider: token.provider,
        },
        process.env.NEXTAUTH_SECRET as string,
        { expiresIn: '1h' } // 토큰 유효 기간 1시간
      );
      token.accessToken = signedToken; // 생성된 JWT 토큰을 accessToken으로 저장

      console.log('JWT Callback - after update:', token);
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - before update:', session);
      console.log('Session Callback - token:', token);
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
        if (token.accessToken) {
          session.jwt = token.accessToken as string;
        }
      }
      console.log('Session Callback - after update:', session);
      return session;
    },
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
