import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { db } from '../../src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toggleFavorite, addToShoppingList, subscribeToFavorites } from '../../src/lib/userService';
import { mockData } from '../../src/lib/mockData';
import PriceHistoryChart from '../../components/PriceHistoryChart';
import { useCart } from '../../src/lib/CartContext';

export default function OfferDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      if (typeof id !== 'string') return;
      try {
        // 1. Try Firestore first
        const docRef = doc(db, 'offers', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setOffer({ id: docSnap.id, ...docSnap.data() });
        } else {
          // 2. Fallback to Central Mock Data for AI Vision Search results
          const matched = mockData.find(m => m.id === id);
          if (matched) {
             setOffer(matched);
          } else if (id.startsWith('flyer-mock-')) {
             // Second safety for slightly different mock IDs
             setOffer(mockData[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching offer:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();

    const unsub = subscribeToFavorites((favs) => {
      setIsFavorited(favs.some(f => f.id === id));
    });
    return () => unsub();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!offer) return;
    await toggleFavorite(offer.id, offer);
  };

  const { items, addItem } = useCart();
  const isAddedToCart = items.some(i => i.title === offer?.title);

  const handleAddToList = async () => {
    if (!offer) return;
    await addToShoppingList({ title: offer.title, price: getSalePrice(offer) });
    addItem({
      id: offer.id || Math.random().toString(),
      title: offer.title,
      price: getSalePrice(offer),
      image: offer.image || offer.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'
    });
    Alert.alert("Success", "Added to your cart and shopping list!");
  };

  // Helper: get the best (lowest) sale price from available price fields
  const getSalePrice = (item: any): number => {
    if (item.newPrice && item.newPrice > 0) return item.newPrice;
    if (item.price && item.price > 0) return item.price;
    if (item.offerPrices && typeof item.offerPrices === 'object') {
      const prices = Object.values(item.offerPrices) as number[];
      const validPrices = prices.filter((p: number) => p > 0);
      if (validPrices.length > 0) return Math.min(...validPrices);
    }
    if (item.oldPrice && item.oldPrice > 0) return Math.round(item.oldPrice * 0.85);
    return 0;
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!offer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Offer not found (ID: {id})</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
           <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offer detail</Text>
        <View style={styles.headerRight}>
           <TouchableOpacity style={styles.headerIcon} onPress={handleToggleFavorite}>
              <Text style={{ fontSize: 20, color: isFavorited ? '#ef4444' : '#9ca3af' }}>{isFavorited ? '❤️' : '🤍'}</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.headerIcon}>
              <Text style={{ fontSize: 20 }}>🔗</Text>
           </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Product Image Card */}
        <View style={styles.imageCard}>
           <Image 
             source={{ uri: offer.image || offer.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' }} 
             style={styles.productImage} 
           />
           {(!offer.image && !offer.imageUrl) && (
              <View style={styles.imageOverlay}>
                 <Text style={{ fontSize: 60 }}>{offer.category?.toLowerCase().includes('electron') ? '📱' : '🍏'}</Text>
              </View>
           )}
        </View>

        <View style={styles.content}>
           {/* Store & Expiry */}
           <View style={styles.storeRow}>
              <View style={styles.storeBadge}>
                 <Text style={styles.storeInitial}>{offer.store?.substring(0, 1)}</Text>
              </View>
              <Text style={styles.storeName}>{offer.store} Holdings</Text>
              <View style={styles.expiryBadge}>
                 <Text style={styles.expiryText}>Expiring soon</Text>
              </View>
           </View>

           {/* Title */}
           <Text style={styles.productName}>{offer.title}</Text>

           {/* Pricing */}
           <View style={styles.priceContainer}>
              <View>
                 <Text style={styles.priceLabel}>Rs.</Text>
                 <Text style={styles.newPrice}>{getSalePrice(offer).toLocaleString()}</Text>
              </View>
              {(offer.oldPrice || offer.originalPrice) && getSalePrice(offer) < (offer.oldPrice || offer.originalPrice) && (
                <Text style={styles.oldPrice}>Rs. {(offer.oldPrice || offer.originalPrice).toLocaleString()}</Text>
              )}
              {(offer.oldPrice || offer.originalPrice) && getSalePrice(offer) < (offer.oldPrice || offer.originalPrice) && (
                <View style={styles.savingsBadge}>
                   <Text style={styles.savingsText}>
                     Save Rs. {((offer.oldPrice || offer.originalPrice) - getSalePrice(offer)).toLocaleString()}
                   </Text>
                </View>
              )}
           </View>

           <View style={styles.divider} />

           {/* Info Items */}
           <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕒</Text>
              <Text style={styles.infoText}>Valid until 30 June 2027</Text>
           </View>
           <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>3 branches in {offer.district || 'Colombo'} District</Text>
           </View>
           <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏷️</Text>
              <Text style={styles.infoText}>{offer.category?.toLowerCase()} · Shopping</Text>
           </View>

           {/* Price History Section */}
            <PriceHistoryChart 
              currentPrice={getSalePrice(offer)} 
              oldPrice={offer.oldPrice} 
              title={offer.title} 
            />

            {/* Terms */}
           <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                 Terms: Limited stock. In-store purchase only. Cannot be combined with other offers.
              </Text>
           </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.actionButton, isAddedToCart && { backgroundColor: '#10b981' }]} 
          onPress={isAddedToCart ? () => router.push('/CartScreen') : handleAddToList}
        >
          <Text style={styles.actionButtonText}>
            {isAddedToCart ? '✓ Added to Cart (View)' : 'Add to shopping list'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  imageCard: {
    margin: 16,
    height: 280,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    opacity: 0.2,
  },
  content: {
    paddingHorizontal: 20,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeBadge: {
    width: 24,
    height: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  storeInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  storeName: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  expiryBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expiryText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  newPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: -4,
  },
  oldPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginTop: 8,
  },
  savingsBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  savingsText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  termsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  termsText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
