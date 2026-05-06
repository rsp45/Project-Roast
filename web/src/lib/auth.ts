import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function getAuthOptions(): NextAuthOptions {
  return {
    secret: requireEnv("NEXTAUTH_SECRET"),
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/auth/sign-in",
      error: "/auth/sign-in",
    },
    providers: [
      GoogleProvider({
        clientId: requireEnv("GOOGLE_CLIENT_ID"),
        clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
          },
        },
      }),
    ],
    callbacks: {
      async redirect({ url, baseUrl }) {
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }
        if (url.startsWith(baseUrl)) {
          return url;
        }
        return `${baseUrl}/app/portfolio`;
      },
      async jwt({ token, account }) {
        if (account?.id_token) {
          token.idToken = account.id_token;
        }
        return token;
      },
      async session({ session, token }) {
        session.idToken =
          typeof token.idToken === "string" ? token.idToken : null;
        return session;
      },
    },
  };
}
