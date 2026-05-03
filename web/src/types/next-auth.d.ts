import "next-auth";

declare module "next-auth" {
  interface Session {
    idToken: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string;
  }
}
