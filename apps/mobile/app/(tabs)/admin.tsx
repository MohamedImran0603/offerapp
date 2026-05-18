import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { Colors } from '../../src/constants/Colors';

interface Offer {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  store: string;
  imageUrl?: string;
  district: string;
  status: string;
}

export default function AdminScreen() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0 });

  const fetchPendingOffers = async () => {
    setLoading(true);
    try {
      // Fetch all offers to filter manually or fetch pending ones
      const q = query(collection(db, 'offers'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      
      const pendingList: Offer[] = [];
      snapshot.forEach((doc) => {
        pendingList.push({ id: doc.id, ...doc.data() } as Offer);
      });
      
      setOffers(pendingList);
      setStats({
        pending: pendingList.length,
        approved: 42 // placeholder for total approved
      });
    } catch (error) {
      console.error('Error fetching admin offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOffers();
  }, []);

  const handleModerate = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const offerRef = doc(db, 'offers', id);
      await updateDoc(offerRef, { status: action });
      
      // Update local state instantly with high fidelity feedback
      setOffers((prev) => prev.filter((item) => item.id !== id));
      setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
      alert(`Offer successfully ${action}!`);
    } catch (error) {
      console.error('Failed to moderate offer:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const renderOfferItem = ({ item }: { item: Offer }) => (
    <View style={styles.offerCard}>
      <View style={styles.cardHeader}>
        <View style={styles.storeBadge}>
          <Text style={styles.storeText}>{item.store}</Text>
        </View>
        <Text style={styles.districtText}>📍 {item.district}</Text>
      </View>

      <View style={styles.cardContent}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.offerImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 24 }}>🛍️</Text>
          </View>
        )}
        <View style={styles.detailsContainer}>
          <Text style={styles.offerTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>LKR {item.price}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPriceText}>LKR {item.originalPrice}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleModerate(item.id, 'rejected')}
        >
          <Text style={styles.rejectButtonText}>❌ Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleModerate(item.id, 'approved')}
        >
          <Text style={styles.approveButtonText}>✅ Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Staff Portal</Text>
          <Text style={styles.headerSubtitle}>Native Administrative Command Center</Text>
        </View>
        <TouchableOpacity onPress={fetchPendingOffers} style={styles.refreshButton}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Counter Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending Moderation</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>System Live Offers</Text>
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading pending approvals...</Text>
        </View>
      ) : offers.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🎉</Text>
          <Text style={styles.emptyText}>All clear! No pending flyer approvals.</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          renderItem={renderOfferItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  offerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  storeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  districtText: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  offerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  originalPriceText: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
  },
  rejectButtonText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
  approveButton: {
    backgroundColor: '#d1fae5',
  },
  approveButtonText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
});
