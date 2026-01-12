"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, useAuth } from "@/features/auth/client";
import { Role } from "@/lib/rbac";
import { normalizeUserForRBAC } from "@/features/auth/guards/utils";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { FaMoneyBillWave, FaUsers, FaChartBar } from "react-icons/fa";

export function Sidebar() {
  const pathname = usePathname();
  const { session } = useSession();
  const { logout } = useAuth();

  const normalizedUser = session?.user
    ? normalizeUserForRBAC(session.user)
    : null;
  const isAdmin = normalizedUser?.roles?.includes(Role.ADMIN) ?? false;

  const navItems = [
    {
      href: "/movimientos",
      label: "Ingresos y egresos",
      icon: FaMoneyBillWave,
    },
    ...(isAdmin
      ? [
          {
            href: "/usuarios",
            label: "Usuarios",
            icon: FaUsers,
          },
          {
            href: "/reportes",
            label: "Reportes",
            icon: FaChartBar,
          },
        ]
      : []),
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-indigo-50 to-white border-r-2 border-indigo-200 flex flex-col shadow-lg">
      <div className="p-5 border-b-2 border-indigo-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
            PYG
          </div>
          <span className="text-base font-bold text-indigo-900">PrevalentWare</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start space-x-3 transition-all duration-200",
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700"
                    : "text-slate-700 hover:bg-indigo-100 hover:text-indigo-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {session?.user && (
        <div className="p-4 border-t-2 border-indigo-200 bg-white space-y-3">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "Avatar"}
                className="h-12 w-12 rounded-full border-2 border-indigo-400 shadow-md"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full text-sm font-semibold"
            size="sm"
          >
            Cerrar sesión
          </Button>
        </div>
      )}
    </aside>
  );
}
