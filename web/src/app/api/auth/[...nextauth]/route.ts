import NextAuth from "next-auth/next";
import { getAuthOptions } from "@/lib/auth";

const handler = NextAuth(getAuthOptions());

export { handler as GET, handler as POST };
