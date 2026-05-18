"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Sidebar() {
  const pathname = usePathname();
  const { role, adminName } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Dynamic Navigation setup based on admin role
  const getNavLinks = () => {
    const base = [
      { href: "/", label: "📊 Overview", roles: ["super_admin", "regional_admin", "merchant_admin", "moderator", "support_agent"] },
      { href: "/offers", label: "🏷️ Offer Catalogue", roles: ["super_admin", "regional_admin", "merchant_admin", "moderator"] },
    ];

    const additions = [
      { href: "/moderation", label: "🛡️ Moderation Queue", roles: ["super_admin", "regional_admin", "moderator"] },
      { href: "/admin-settings", label: "⚙️ System Clearance", roles: ["super_admin"] },
      { href: "/support", label: "💬 Support Desk", roles: ["super_admin", "support_agent"] },
    ];

    return [...base, ...additions].filter(link => role && link.roles.includes(role));
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-72 bg-zinc-950 text-white flex flex-col border-r border-zinc-800/80">
      {/* Brand Header */}
      <div className="p-8 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20">
            OL
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 tracking-tight">Offer Lanka</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">Enterprise Panel</span>
          </div>
        </div>
      </div>

      {/* Role Profile Badge */}
      <div className="mx-4 mt-6 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg">
            👤
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-zinc-200 truncate">{adminName || "Administrator"}</h4>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {role?.replace("_", " ") || "moderator"}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Nav items */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 block mb-4">Navigation</span>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                isActive
                  ? "bg-purple-600/10 border-purple-500/30 text-purple-400"
                  : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-6 border-t border-zinc-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-red-950/20 hover:text-red-400 border border-zinc-800 hover:border-red-500/20 text-sm font-bold text-zinc-400 transition-all duration-250"
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
