import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { Role } from "@/generated/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      const role: Role = user.email?.endsWith("@ugm.ac.id")
        ? Role.DOSEN
        : Role.MAHASISWA;

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          role: role,
        },
      });
    },
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) {
        throw new Error("No email found in profile");
      }

      const allowedDomains = ["ugm.ac.id", "mail.ugm.ac.id"];
      const userDomain = profile.email.split("@")[1];

      if (allowedDomains.includes(userDomain)) {
        return true;
      } else {
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id || token.sub) as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});