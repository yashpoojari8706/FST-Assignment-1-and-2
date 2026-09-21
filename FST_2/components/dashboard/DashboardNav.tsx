"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Terminal, Shield, LogOut, Database, Cpu } from "lucide-react";
import { RoleName } from "@prisma/client";

interface DashboardNavProps {
  user: {
    name: string;
    email: string;
  };
  tenants: Array<{
    id: string;
    name: string;
    slug: string;
    role: RoleName;
  }>;
  activeTenantId: string;
  activeRole: RoleName;
}

export function DashboardNav({
  user,
  tenants,
  activeTenantId,
  activeRole,
}: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTenantId = e.target.value;
    router.push(`${pathname}?tenantId=${newTenantId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const navItems = [
    { name: "SYSTEM OVERVIEW", href: `/dashboard?tenantId=${activeTenantId}` },
    { name: "TRANSACTION LEDGER", href: `/dashboard/transactions?tenantId=${activeTenantId}` },
    ...(activeRole === "ADMIN"
      ? [{ name: "SECURITY AUDIT TRAIL", href: `/dashboard/audit-logs?tenantId=${activeTenantId}` }]
      : []),
  ];

  return (
    <header className="border-b border-[#232d3d] bg-[#0e131b] sticky top-0 z-40">
      {/* Top Telemetry Strip */}
      <div className="border-b border-[#1b2330] px-4 py-1 flex items-center justify-between text-[10px] font-mono-tech text-[#57677e]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            CONSOLE OPERATIONAL
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">SECURITY ENGINE: BETTER-AUTH v1.2</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">PROXY GATE: NODE-RUNTIME ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-[#00d2ff]" /> POSTGRES: 5432 / MONGO: 27017
          </span>
        </div>
      </div>

      {/* Main Console Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Brand */}
          <Link href={`/dashboard?tenantId=${activeTenantId}`} className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-[#18202c] border border-[#3b495e] flex items-center justify-center text-[#00d2ff]">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider text-[#e6edf3] font-mono-tech">
                SECURE<span className="text-[#00d2ff]">OPS</span>
              </span>
              <span className="text-[9px] text-[#57677e] font-mono-tech tracking-tight leading-none">
                CONTROL ROOM // v2.0
              </span>
            </div>
          </Link>

          {/* Tenant Organization Switcher */}
          <div className="flex items-center gap-2 bg-[#121720] border border-[#232d3d] px-2.5 py-1 rounded">
            <span className="text-[10px] font-bold text-[#57677e] font-mono-tech">TENANT:</span>
            <select
              value={activeTenantId}
              onChange={handleTenantChange}
              className="bg-transparent text-xs font-mono-tech font-semibold text-[#e6edf3] focus:outline-none cursor-pointer"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#121720] text-[#e6edf3]">
                  {t.name} [{t.role}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href.split("?")[0];
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-1.5 rounded text-xs font-mono-tech font-bold transition border ${
                  isActive
                    ? "bg-[#18202c] text-[#00d2ff] border-[#3b495e]"
                    : "text-[#8b9bb4] hover:text-[#e6edf3] border-transparent hover:border-[#232d3d]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Identity & Clearance Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-[#e6edf3] font-mono-tech">{user.name}</div>
            <div className="text-[10px] text-[#57677e] font-mono-tech flex items-center justify-end gap-1.5">
              <span>{user.email}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono-tech border ${
                  activeRole === "ADMIN"
                    ? "bg-purple-950/40 text-purple-300 border-purple-800"
                    : activeRole === "MEMBER"
                    ? "bg-sky-950/40 text-sky-300 border-sky-800"
                    : "bg-amber-950/40 text-amber-300 border-amber-800"
                }`}
              >
                ROLE:{activeRole}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Terminate Session"
            className="p-1.5 rounded bg-[#18202c] border border-[#232d3d] text-[#8b9bb4] hover:text-red-400 hover:border-red-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
