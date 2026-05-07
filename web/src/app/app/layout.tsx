import { getAuthOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(getAuthOptions());

  if (!session) {
    redirect("/auth/sign-in");
  }

  const userName = session.user?.name ?? "The Interrogator";
  const userEmail = session.user?.email ?? "AI Active";

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-hidden">
      <AppSidebar userName={userName} userEmail={userEmail} />
      
      {/* Main Content */}
      <main className="flex-1 md:ml-[280px] h-screen overflow-y-auto pt-16 md:pt-0 bg-background relative">
        {/* Ambient Background Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-container via-background to-background"></div>
        <div className="max-w-[1440px] mx-auto p-margin relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
