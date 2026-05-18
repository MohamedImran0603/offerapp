"use client";

import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { logAdminActivity } from "@/lib/auditLogger";
import RoleGuard from "@/components/RoleGuard";

interface ModerationItem {
  id: string;
  title: string;
  store: string;
  category: string;
  price: number;
  imageUrl: string;
  fraudRiskScore: number;
  duplicateDetected: boolean;
  status: "pending" | "approved" | "flagged";
  reason?: string;
}

export default function ModerationPage() {
  const { user, role } = useAuth();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock pending queue items if database is clean (to support seamless live demo)
  const mockPendingItems: ModerationItem[] = [
    {
      id: "pending_demo_1",
      title: "Apple iPhone 15 Pro 128GB (98% Discount!)",
      store: "Abans Tech Fest",
      category: "Electronics",
      price: 5000, // Extremely low price - high fraud risk!
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
      fraudRiskScore: 0.94, // 94% Risk
      duplicateDetected: false,
      status: "pending",
      reason: "Suspiciously low price detected for electronics category (98% below market value)"
    },
    {
      id: "pending_demo_2",
      title: "Keells Sugar 1kg Flyer",
      store: "Keells",
      category: "Food - Grocery",
      price: 290,
      imageUrl: "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=300",
      fraudRiskScore: 0.05,
      duplicateDetected: true, // Duplicate image upload
      status: "pending",
      reason: "Matched 99% similarity index with an active flyer uploaded 2 hours ago"
    },
    {
      id: "pending_demo_3",
      title: "Glomark Fresh Carrots 1kg",
      store: "Glomark",
      category: "Fruits & Vegetable",
      price: 420,
      imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300",
      fraudRiskScore: 0.02,
      duplicateDetected: false,
      status: "pending"
    }
  ];

  useEffect(() => {
    const q = query(collection(db, "offers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbOffers = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            store: data.store || "",
            category: data.category || "",
            price: data.price || 0,
            imageUrl: data.imageUrl || data.image || "",
            fraudRiskScore: data.fraudRiskScore || 0,
            duplicateDetected: data.duplicateDetected || false,
            status: data.status || "pending",
            reason: data.reason || ""
          } as ModerationItem;
        })
        .filter(item => item.status === "pending");

      // Merge mock items with Firestore pending items so queue is never empty
      setItems([...dbOffers, ...mockPendingItems]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (item: ModerationItem) => {
    try {
      if (item.id.startsWith("pending_demo")) {
        // Mock item action
        setItems(prev => prev.filter(i => i.id !== item.id));
      } else {
        // Real Firestore document update
        await updateDoc(doc(db, "offers", item.id), { status: "approved" });
      }

      if (user) {
        await logAdminActivity({
          adminId: user.uid,
          adminEmail: user.email || "unknown",
          role: role || "moderator",
          action: "APPROVE_OFFER",
          targetId: item.id,
          details: `Approved offer campaign: "${item.title}" for store ${item.store}`
        });
      }
      alert(`✅ Offer "${item.title}" successfully approved and published live!`);
    } catch (error) {
      console.error("Error approving item:", error);
      alert("Failed to approve item.");
    }
  };

  const handleReject = async (item: ModerationItem) => {
    try {
      if (item.id.startsWith("pending_demo")) {
        setItems(prev => prev.filter(i => i.id !== item.id));
      } else {
        await updateDoc(doc(db, "offers", item.id), { status: "flagged" });
      }

      if (user) {
        await logAdminActivity({
          adminId: user.uid,
          adminEmail: user.email || "unknown",
          role: role || "moderator",
          action: "DELETE_OFFER",
          targetId: item.id,
          details: `Flagged and rejected offer due to moderation rules: "${item.title}"`
        });
      }
      alert(`🛡️ Offer "${item.title}" has been flagged and rejected.`);
    } catch (error) {
      console.error("Error rejecting item:", error);
      alert("Failed to reject item.");
    }
  };

  return (
    <RoleGuard allowedRoles={["super_admin", "regional_admin", "moderator"]}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-zinc-850 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Moderation Dashboard</h1>
            <p className="text-sm text-zinc-400 mt-2">Evaluate suspect pricing, duplicate flyers, and approve campaigns before they go public.</p>
          </div>
          <div className="bg-purple-950/40 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-xl text-xs font-bold font-mono">
            Queue Count: {items.length} pending
          </div>
        </div>

        {/* Pending Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-zinc-950 border border-zinc-850 rounded-2xl text-center">
            <span className="text-4xl mb-4">🎉</span>
            <h3 className="text-lg font-bold text-zinc-200">Moderation Queue is Clean</h3>
            <p className="text-xs text-zinc-500 mt-1">All recently uploaded flyers and discount sheets are active.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`bg-zinc-950 border rounded-2xl overflow-hidden shadow-lg transition-all duration-200 flex flex-col ${
                  item.fraudRiskScore > 0.5 
                    ? "border-red-500/30 hover:border-red-500/50" 
                    : item.duplicateDetected 
                    ? "border-amber-500/30 hover:border-amber-500/50" 
                    : "border-zinc-850 hover:border-zinc-800"
                }`}
              >
                {/* Product Image & Risk overlays */}
                <div className="relative h-44 bg-zinc-900 flex items-center justify-center overflow-hidden border-b border-zinc-900">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🏷️</span>
                  )}

                  {/* High Risk Overlay Banner */}
                  {item.fraudRiskScore > 0.5 && (
                    <div className="absolute top-3 left-3 bg-red-600 border border-red-500 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg">
                      🚨 High Risk: {Math.round(item.fraudRiskScore * 100)}%
                    </div>
                  )}

                  {/* Duplicate Overlay Banner */}
                  {item.duplicateDetected && (
                    <div className="absolute top-3 left-3 bg-amber-600 border border-amber-500 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg">
                      ⚠️ Duplicate Flyer Match
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{item.store}</span>
                      <span className="text-zinc-500 text-xs font-semibold">{item.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 line-clamp-1" title={item.title}>{item.title}</h3>
                    <p className="text-lg font-extrabold text-emerald-400">Rs. {item.price.toLocaleString()}</p>

                    {/* AI Moderation Reason */}
                    {item.reason && (
                      <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                        item.fraudRiskScore > 0.5 
                          ? "bg-red-950/20 border-red-500/20 text-red-400" 
                          : "bg-amber-950/20 border-amber-500/20 text-amber-400"
                      }`}>
                        <strong>AI Reason:</strong> {item.reason}
                      </div>
                    )}
                  </div>

                  {/* Moderation Controls */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => handleReject(item)}
                      className="py-2.5 bg-zinc-900 border border-zinc-800 hover:border-red-500/30 hover:bg-red-950/20 text-xs font-bold text-zinc-400 hover:text-red-400 rounded-xl transition-all"
                    >
                      🛡️ Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(item)}
                      className="py-2.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-purple-600/10 transition-all"
                    >
                      ✅ Approve
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </RoleGuard>
  );
}
