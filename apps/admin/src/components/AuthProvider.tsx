"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  permissions: string[];
  adminName: string | null;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  role: null,
  permissions: [],
  adminName: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      if (currentUser) {
        try {
          const docRef = doc(db, "admins", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role || "moderator");
            setPermissions(data.permissions || []);
            setAdminName(data.name || "Administrator");
          } else {
            // First time login - auto create super_admin configuration!
            const newAdmin = {
              name: currentUser.displayName || currentUser.email?.split("@")[0] || "Super Admin",
              email: currentUser.email,
              role: "super_admin",
              districts: ["All"],
              permissions: [
                "offers.create",
                "offers.edit",
                "offers.delete",
                "offers.approve",
                "users.manage",
                "analytics.view",
                "notifications.send"
              ],
              mfaEnabled: false,
              isActive: true,
              lastLogin: new Date().toISOString(),
              createdAt: new Date().toISOString()
            };
            await setDoc(docRef, newAdmin);
            setRole("super_admin");
            setPermissions(newAdmin.permissions);
            setAdminName(newAdmin.name);
          }
        } catch (error) {
          console.error("Error setting role in AuthProvider:", error);
          setRole("moderator");
        }
      } else {
        setRole(null);
        setPermissions([]);
        setAdminName(null);
      }

      setLoading(false);

      if (!currentUser && pathname !== "/login") {
        router.push("/login");
      } else if (currentUser && pathname === "/login") {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, role, permissions, adminName }}>
      {pathname !== "/login" && !user ? null : children}
    </AuthContext.Provider>
  );
};
