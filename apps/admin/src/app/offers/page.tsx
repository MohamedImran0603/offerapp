"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AddOfferForm } from "@/components/AddOfferForm";
import { useAuth } from "@/components/AuthProvider";
import { logAdminActivity } from "@/lib/auditLogger";

export default function OffersPage() {
  const { user, role } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOffers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const targetOffer = offers.find(o => o.id === id);
    if (!targetOffer) return;

    if (window.confirm(`Are you sure you want to delete this offer: "${targetOffer.title}"?`)) {
      try {
        await deleteDoc(doc(db, "offers", id));
        
        if (user) {
          await logAdminActivity({
            adminId: user.uid,
            adminEmail: user.email || "unknown",
            role: role || "moderator",
            action: "DELETE_OFFER",
            targetId: id,
            details: `Deleted offer campaign: "${targetOffer.title}" by ${targetOffer.store}`
          });
        }
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete offer");
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Offers</h1>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
          >
            + Add New Offer
          </button>
        )}
      </div>

      {showAddForm && (
        <AddOfferForm 
          onSuccess={() => setShowAddForm(false)} 
          onCancel={() => setShowAddForm(false)} 
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Image</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Product Title</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Store</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Price</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading offers...</td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No offers found. Add one above!</td>
                </tr>
              ) : (
                offers.map(offer => (
                  <tr key={offer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {offer.imageUrl ? (
                        <img src={offer.imageUrl} alt={offer.title} className="w-12 h-12 rounded object-cover border" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Img</div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-900">{offer.title}</td>
                    <td className="p-4 text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs text-slate-800 font-medium">{offer.store}</span>
                    </td>
                    <td className="p-4 text-gray-900 font-medium">Rs. {offer.price}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(offer.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm font-medium"
                        title="Delete Offer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
