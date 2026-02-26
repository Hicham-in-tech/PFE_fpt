import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "TEAM_LEADER") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <Sidebar role={session.role} userName={session.name} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader role={session.role} userName={session.name} />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
