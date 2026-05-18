"use client";

import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { logAdminActivity } from "@/lib/auditLogger";
import RoleGuard from "@/components/RoleGuard";

export default function AdminSettingsPage() {
  const { user, role } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Form onboarding state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    uid: "",
    role: "moderator",
    district: "Whole Country"
  });
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Fetch audit logs
  useEffect(() => {
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
      setLoadingLogs(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.uid || !formData.email || !formData.name) {
      alert("Please fill in all onboarding fields including UID.");
      return;
    }

    setOnboardLoading(true);
    try {
      const docRef = doc(db, "admins", formData.uid);
      const newAdminRecord = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        districts: [formData.district],
        permissions: 
          formData.role === "super_admin" 
            ? ["offers.create", "offers.edit", "offers.delete", "offers.approve", "users.manage", "analytics.view", "notifications.send"]
            : formData.role === "regional_admin"
            ? ["offers.create", "offers.edit", "offers.approve"]
            : ["offers.approve"],
        mfaEnabled: false,
        isActive: true,
        lastLogin: "",
        createdAt: new Date().toISOString()
      };

      await setDoc(docRef, newAdminRecord);

      // Track the activity in the audit logs
      if (user) {
        await logAdminActivity({
          adminId: user.uid,
          adminEmail: user.email || "unknown",
          role: role || "super_admin",
          action: "UPDATE_ROLE",
          targetId: formData.uid,
          details: `Onboarded new staff: "${formData.name}" as a ${formData.role.replace("_", " ")}`
        });
      }

      alert("🎉 Administrator successfully onboarded!");
      setFormData({
        name: "",
        email: "",
        uid: "",
        role: "moderator",
        district: "Whole Country"
      });
    } catch (error) {
      console.error("Error onboarding staff: ", error);
      alert("Failed to onboard new administrator.");
    } finally {
      setOnboardLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        
        {/* Title Header */}
        <div className="border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Clearance & Settings</h1>
          <p className="text-sm text-zinc-400 mt-2">Manage backend system admin clearances, roles, and review the global enterprise audit trail.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Onboard Form Card */}
          <div className="lg:col-span-1 bg-zinc-950 p-6 rounded-2xl border border-zinc-850 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Onboard New Admin Staff</h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Create and provision authorization credentials for moderators, regional officers, or merchant profiles.</p>

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Staff Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 rounded-xl text-sm focus:border-purple-500 outline-none transition-all"
                  placeholder="e.g. Kisotharan"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Staff Email</label>
                <input 
                  required 
                  type="email" 
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 rounded-xl text-sm focus:border-purple-500 outline-none transition-all"
                  placeholder="admin@offerlanka.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">User Auth UID (Firebase)</label>
                <input 
                  required 
                  type="text" 
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 rounded-xl text-sm font-mono focus:border-purple-500 outline-none transition-all"
                  placeholder="e.g. bG12H4J8z7dY9..."
                  value={formData.uid}
                  onChange={e => setFormData({ ...formData, uid: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Assigned Role</label>
                <select 
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 rounded-xl text-sm focus:border-purple-500 outline-none transition-all"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="moderator">🛡️ Moderator (Approver)</option>
                  <option value="regional_admin">📍 Regional Admin (District)</option>
                  <option value="super_admin">⚡ Super Admin (Full Root)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Assigned District</label>
                <select 
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 rounded-xl text-sm focus:border-purple-500 outline-none transition-all"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                >
                  <option>Whole Country</option>
                  <option>Colombo</option>
                  <option>Gampaha</option>
                  <option>Kandy</option>
                  <option>Jaffna</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={onboardLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/20 transition-all mt-4"
              >
                {onboardLoading ? "Onboarding..." : "✨ Complete Provisioning"}
              </button>
            </form>
          </div>

          {/* Audit Logs Table Card */}
          <div className="lg:col-span-2 bg-zinc-950 p-6 rounded-2xl border border-zinc-850 shadow-xl flex flex-col h-[600px]">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">Unalterable Audit Trail Log</h2>
              <p className="text-xs text-zinc-400 mt-1">Read-only global ledger recording administrative activity across all roles.</p>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-zinc-850">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-850">
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Action</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Admin Email</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Details</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500 text-xs font-semibold">Loading logs...</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500 text-xs font-semibold">No audit entries found in Firestore.</td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors text-xs">
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                            log.action === "CREATE_OFFER" 
                              ? "bg-purple-950/40 border border-purple-500/20 text-purple-400" 
                              : log.action === "DELETE_OFFER"
                              ? "bg-red-950/40 border border-red-500/20 text-red-400"
                              : "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400"
                          }`}>
                            {log.action?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-300 font-semibold truncate max-w-[120px]">{log.adminEmail}</td>
                        <td className="p-3 text-zinc-400 leading-relaxed max-w-[200px] truncate" title={log.details}>{log.details}</td>
                        <td className="p-3 text-zinc-500 text-right">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "n/a"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </RoleGuard>
  );
}
