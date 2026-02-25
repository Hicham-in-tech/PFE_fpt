"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MessageSquare,
  Eye,
  Star,
  LogOut,
  Shield,
  UserPlus,
  BarChart3
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: string;
  userName: string;
  isMobile?: boolean;
}

export default function Sidebar({ role, userName, isMobile = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [];

  if (role === "TEAM_LEADER") {
    navItems.push(
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: "My Team", href: "/dashboard/team", icon: <Users className="h-5 w-5" /> },
      { label: "Projects", href: "/dashboard/projects", icon: <FolderKanban className="h-5 w-5" /> },
      { label: "Remarks", href: "/dashboard/remarks", icon: <Eye className="h-5 w-5" /> },
      { label: "Chat", href: "/dashboard/chat", icon: <MessageSquare className="h-5 w-5" /> }
    );
  } else if (role === "COORDINATOR") {
    navItems.push(
      { label: "Dashboard", href: "/coordinator", icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: "All Teams", href: "/coordinator/teams", icon: <Users className="h-5 w-5" /> },
      { label: "My Teams", href: "/coordinator/my-teams", icon: <Users className="h-5 w-5" /> },
      { label: "Projects", href: "/coordinator/projects", icon: <FolderKanban className="h-5 w-5" /> },
      { label: "Observations", href: "/coordinator/observations", icon: <Eye className="h-5 w-5" /> },
      { label: "Evaluations", href: "/coordinator/evaluations", icon: <Star className="h-5 w-5" /> },
      { label: "Chat", href: "/coordinator/chat", icon: <MessageSquare className="h-5 w-5" /> }
    );
  } else if (role === "SUPER_ADMIN") {
    navItems.push(
      { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: "All Users", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
      { label: "Create Coordinator", href: "/admin/coordinators", icon: <UserPlus className="h-5 w-5" /> },
      { label: "All Teams", href: "/admin/teams", icon: <Shield className="h-5 w-5" /> },
      { label: "All Projects", href: "/admin/projects", icon: <FolderKanban className="h-5 w-5" /> },
      { label: "Statistics", href: "/admin/stats", icon: <BarChart3 className="h-5 w-5" /> }
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col ${isMobile ? 'h-full' : 'min-h-screen sticky top-0'}`}>
      <div className="p-4 border-b border-slate-800 bg-slate-950">
        <div className="bg-white rounded-xl p-3 mb-4 shadow-lg shadow-fpt-blue/20">
          <Image src="/fpt-logo.png" alt="FPT Logo" width={200} height={60} className="w-full h-auto object-contain" />
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <p className="text-sm font-medium text-white truncate">{userName}</p>
          <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-fpt-green/20 text-fpt-lightGreen px-2 py-0.5 rounded-full border border-fpt-green/30">
            {role.replace("_", " ")}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-fpt-blue text-white shadow-md shadow-fpt-blue/20"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-fpt-lightBlue'} transition-colors`}>
                  {item.icon}
                </div>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
