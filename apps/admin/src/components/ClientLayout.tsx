"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="flex h-screen bg-zinc-900 overflow-hidden text-zinc-100">
      {/* Dynamic Role-Aware Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-900/40">
        {children}
      </main>
    </div>
  );
};
