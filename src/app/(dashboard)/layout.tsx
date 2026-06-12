import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch user plan for header display (graceful fallback if DB is unreachable)
  let userPlan = "FREE";
  try {
    const userRecord = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    userPlan = userRecord?.plan ?? "FREE";
  } catch {
    // DB temporarily unreachable — default to FREE plan, page still renders
    console.warn("Could not fetch user plan, defaulting to FREE");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={session.user} plan={userPlan} />
      <div className="flex flex-1 flex-col lg:ml-64">
        <DashboardHeader user={session.user} plan={userPlan} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
