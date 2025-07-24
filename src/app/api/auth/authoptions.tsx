import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.OAUTH_CLIENT_ID!,
      clientSecret: process.env.OAUTH_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Do NOT create user here — let onboarding POST handle it
          token.isNewUser = true;
        } else {
          token.isNewUser = false;
        }
      }
      return token;
    },

    async session({ session, token }) {
      (session.user as any).isNewUser = token.isNewUser ?? false;
      return session;
    },
  },
};