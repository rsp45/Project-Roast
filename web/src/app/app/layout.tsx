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
  const userImage = session.user?.image;

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-hidden">
      <AppSidebar userName={userName} userEmail={userEmail} userImage={userImage} />

      {/* Floating particle ambient layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        {[
          { bottom: "10%", left: "15%" }, { bottom: "20%", left: "25%" }, { bottom: "5%",  left: "40%" },
          { bottom: "35%", left: "55%" }, { bottom: "8%",  left: "70%" }, { bottom: "25%", left: "80%" },
          { bottom: "15%", left: "90%" }, { bottom: "50%", left: "60%" }, { bottom: "40%", left: "30%" },
          { bottom: "60%", left: "10%" },
        ].map((pos, i) => (
          <div key={i} className="particle" style={pos} />
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-[280px] h-screen overflow-y-auto pt-16 md:pt-0 bg-background relative">
        {/* Ambient Background Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-container via-background to-background" />
        <div className="max-w-[1440px] mx-auto p-margin relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
