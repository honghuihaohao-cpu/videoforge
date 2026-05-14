import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "demo",
      credentials: { username: {} },
      async authorize(credentials) {
        // Demo mode: any username with "demo" logs in
        if (credentials?.username === "demo") {
          return { id: "demo", name: "Demo User", email: "demo@videoforge.app" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth }) {
      return true; // Allow all access, auth is optional
    },
  },
});
