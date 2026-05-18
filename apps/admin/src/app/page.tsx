"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [offerCount, setOfferCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const offersSnapshot = await getDocs(collection(db, "offers"));
        setOfferCount(offersSnapshot.size);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Offers</h3>
          <p className="text-3xl font-bold mt-2 text-slate-900">
            {loading ? "..." : offerCount}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Active Stores</h3>
          <p className="text-3xl font-bold mt-2 text-slate-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">System Status</h3>
          <p className="text-3xl font-bold mt-2 text-green-500">Live</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Recent System Activity</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="font-medium text-gray-900">Database Connection Established</p>
              <p className="text-sm text-gray-500">Just now</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Success</span>
          </div>
        </div>
      </div>
    </div>
  );
}
