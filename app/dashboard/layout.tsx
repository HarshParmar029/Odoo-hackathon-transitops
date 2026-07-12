"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Truck, Users, MapPin, Wrench, Fuel, FileBarChart, LogOut } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vehicles", href: "/dashboard/vehicles", icon: Truck },
  { name: "Drivers", href: "/dashboard/drivers", icon: Users },
  { name: "Trips", href: "/dashboard/trips", icon: MapPin },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Fuel & Expenses", href: "/dashboard/fuel", icon: Fuel },
  { name: "Reports", href: "/dashboard/reports", icon: FileBarChart },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed flex h-screen w-64 flex-col bg-slate-900 text-white">
        <div className="border-b border-slate-800 p-6">
          <h1 className="text-xl font-bold">TransitOps</h1>
          <p className="mt-1 text-xs text-slate-400">Fleet Operations</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                  active ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="text-sm font-medium">{user?.name || "Loading..."}</p>
          <p className="mb-3 text-xs text-slate-400">{user?.role?.replace(/_/g, " ")}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-300 hover:text-red-400">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
