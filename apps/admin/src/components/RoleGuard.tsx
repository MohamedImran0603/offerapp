"use client";

import React from "react";
import { useAuth } from "./AuthProvider";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If user has the required role, render content
  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // Visual Fallback overlays if access is denied
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-red-500/20 max-w-md mx-auto my-12 text-center shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center mb-6">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
        Your administrator account profile ({role || "none"}) is not authorized to view this security sector or configuration panel.
      </p>
      <div className="text-xs text-zinc-600 font-mono">
        Required clearance: [{allowedRoles.join(", ")}]
      </div>
    </div>
  );
}
