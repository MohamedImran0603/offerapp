"use client";

import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { logAdminActivity } from "@/lib/auditLogger";

export const AddOfferForm = ({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    store: "Keells",
    category: "Food - Grocery",
    price: "",
    oldPrice: "",
    imageUrl: "",
    pages: "1"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, "offers"), {
        ...formData,
        price: parseFloat(formData.price) || 0,
        oldPrice: parseFloat(formData.oldPrice) || 0,
        createdAt: serverTimestamp()
      });

      if (user) {
        await logAdminActivity({
          adminId: user.uid,
          adminEmail: user.email || "unknown",
          role: role || "moderator",
          action: "CREATE_OFFER",
          targetId: docRef.id,
          details: `Created new offer flyer: "${formData.title}" at ${formData.store}`
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to add offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-bold mb-4">Add New Offer</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
            <input required type="text" className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
            <select className="w-full border p-2 rounded" value={formData.store} onChange={e => setFormData({...formData, store: e.target.value})}>
              <option>Keells</option>
              <option>Softlogic</option>
              <option>Arpico</option>
              <option>Cargills</option>
              <option>Glomark</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option>Food - Grocery</option>
              <option>Electronics</option>
              <option>Fruits & Vegetable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input required type="url" className="w-full border p-2 rounded" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (LKR)</label>
            <input required type="number" className="w-full border p-2 rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old Price (LKR)</label>
            <input type="number" className="w-full border p-2 rounded" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Saving..." : "Save Offer"}
          </button>
        </div>
      </form>
    </div>
  );
};
