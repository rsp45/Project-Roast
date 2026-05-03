import { getAuthOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { AppTopbar } from "@/components/AppTopbar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(getAuthOptions());

  if (!session?.user?.email) {
    redirect("/auth/sign-in");
  }

  const userName = session.user.name ?? "Trader";
  const userEmail = session.user.email;

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar userName={userName} userEmail={userEmail} />
        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
