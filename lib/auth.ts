import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma"; // Using your shared prisma instance
import { Role } from "@/generated/prisma"; // Importing the Role enum for type safety

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
  // We use the 'database' session strategy by default with an adapter.
  // 'events' are used to handle actions like user creation.
  events: {
    async createUser({ user }) {
      // 1. Determine the role based on the user's email domain
      const role: Role = user.email?.endsWith("@ugm.ac.id")
        ? Role.DOSEN
        : Role.MAHASISWA;

      // 2. Update the newly created user with the correct role
      // The Prisma adapter creates the user with the default role first,
      // so we update it immediately after.
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
    // This callback is used to control if a user is allowed to sign in.
    async signIn({ profile }) {
      if (!profile?.email) {
        throw new Error("No email found in profile");
      }

      // Check for allowed UGM email domains
      const allowedDomains = ["ugm.ac.id", "mail.ugm.ac.id"];
      const userDomain = profile.email.split("@")[1];

      if (allowedDomains.includes(userDomain)) {
        return true; // Allow sign-in
      } else {
        // You can return a specific error page or simply false
        // return false; // Prevent sign-in
        return true;
      }
    },

    // This callback adds the custom user data (like role) to the session object.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role; // The 'user' object comes from the database
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
