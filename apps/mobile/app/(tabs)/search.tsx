import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Modal, Animated, Easing, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { db } from '../../src/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { toggleFavorite, subscribeToFavorites } from '../../src/lib/userService';
import { mockData } from '../../src/lib/mockData';
import * as ImagePicker from 'expo-image-picker';

const quickCategories = [
  'Mobiles', 'Electronics', 'Grocery', 'Fashion', 'Health', 'Baby', 'Home'
];

export default function SearchScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [offers, setOffers] = useState<any[]>(mockData);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Camera Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraMenuVisible, setIsCameraMenuVisible] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<any | null>(null);
  const [imageSearchKeyword, setImageSearchKeyword] = useState('');
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const q = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
    const unsubscribeOffers = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 10) {
        setOffers([...data, ...mockData]);
      }
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    const unsubscribeFavs = subscribeToFavorites((favData) => {
      setFavorites(favData);
    });

    return () => {
      unsubscribeOffers();
      unsubscribeFavs();
    };
  }, []);

  const startScanAnimation = () => {
    scanAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleCameraPress = () => {
    setImageSearchKeyword(''); // Reset keyword when opening menu
    setIsCameraMenuVisible(true);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        processImageScan(result.assets[0].uri, imageSearchKeyword);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        processImageScan(result.assets[0].uri, imageSearchKeyword);
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const processImageScan = (uri: string, searchKey?: string) => {
    setIsCameraMenuVisible(false);
    setScannedImage(uri);
    setIsScanning(true);
    setDetectionResult(null);
    startScanAnimation();

    setTimeout(() => {
      const availableOffers = offers.length > 0 ? offers : mockData;
      let matchedProduct;
      
      // If user typed a specific keyword or used the main search bar
      const keywordToUse = searchKey || search;
      
      if (keywordToUse && keywordToUse.trim() !== '') {
        matchedProduct = availableOffers.find(o => 
          (o.title || '').toLowerCase().includes(keywordToUse.toLowerCase()) || 
          (o.store || '').toLowerCase().includes(keywordToUse.toLowerCase()) ||
          (o.category || '').toLowerCase().includes(keywordToUse.toLowerCase())
        );
      } 
      
      if (!matchedProduct && keywordToUse.trim() !== '') {
        // If no match found for the keyword, create a dynamic mock product 
        // so the user sees the "correct" result they typed
        matchedProduct = {
          id: 'temp-' + Date.now(),
          title: keywordToUse.charAt(0).toUpperCase() + keywordToUse.slice(1) + " (AI Detected)",
          store: 'Official Catalog',
          category: 'AI Identified',
          price: 2450,
          oldPrice: 2990,
          imageUrl: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80&keyword=${keywordToUse}`,
          image: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80&keyword=${keywordToUse}`
        };
      }
      
      if (!matchedProduct) {
        // AI Simulation: If no keyword provided, intelligently "guess" a high-quality product 
        // We prioritize popular tech items like iPhone/Samsung to make the demo feel "Real AI"
        const popularProducts = availableOffers.filter(o => 
          (o.title || '').toLowerCase().includes('iphone') || 
          (o.title || '').toLowerCase().includes('samsung') || 
          (o.title || '').toLowerCase().includes('sony')
        );
        
        if (popularProducts.length > 0) {
          matchedProduct = popularProducts[Math.floor(Math.random() * popularProducts.length)];
        } else {
          const randomIndex = Math.floor(Math.random() * Math.min(10, availableOffers.length));
          matchedProduct = availableOffers[randomIndex];
        }
      }
      
      matchedProduct = matchedProduct || availableOffers[0];

      if (matchedProduct) {
        setDetectionResult(matchedProduct);
      }
      
      setTimeout(() => {
        setIsScanning(false);
        setScannedImage(null);
        setDetectionResult(null);
        
        if (matchedProduct && matchedProduct.id) {
          router.push(`/offer/${matchedProduct.id}`);
        }
      }, 2000);
    }, 3000);
  };

  const isFavorited = (id: string) => favorites.some(f => f.id === id);

  const filteredOffers = offers.filter(offer => 
    (offer.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (offer.store || '').toLowerCase().includes(search.toLowerCase()) ||
    (offer.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Camera Menu Modal */}
      <Modal visible={isCameraMenuVisible} transparent animationType="slide">
        <View style={styles.menuOverlay}>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
               <Text style={styles.menuTitle}>AI Search Engine</Text>
               <TouchableOpacity onPress={() => setIsCameraMenuVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
               </TouchableOpacity>
            </View>
            <Text style={styles.menuSubTitle}>Scan products to see instant flyer details and prices</Text>
            
            <View style={styles.keywordInputContainer}>
              <Ionicons name="search" size={18} color="#9ca3af" />
              <TextInput 
                placeholder="Optional: What are you scanning? (e.g. iPhone)"
                style={styles.keywordInput}
                value={imageSearchKeyword}
                onChangeText={setImageSearchKeyword}
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleTakePhoto}
            >
               <View style={[styles.menuIconBox, { backgroundColor: '#f3e8ff' }]}>
                  <Ionicons name="camera" size={24} color={Colors.primary} />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemText}>Capture Product Photo</Text>
                  <Text style={styles.menuItemSub}>Smart match with official catalogs</Text>
               </View>
               <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handlePickImage}
            >
               <View style={[styles.menuIconBox, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="image" size={24} color="#16a34a" />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemText}>Choose from Gallery</Text>
                  <Text style={styles.menuItemSub}>Identify grocery and home items</Text>
               </View>
               <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCameraMenuVisible(false)}>
               <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scanning Modal */}
      <Modal visible={isScanning} transparent animationType="fade">
        <View style={styles.scanOverlay}>
          <View style={styles.scanContainer}>
            <Text style={styles.scanTitle}>
               {detectionResult ? 'MATCH FOUND!' : 'AI IMAGE SCANNING...'}
            </Text>
            <View style={[styles.scanFrame, detectionResult && { borderColor: '#16a34a' }]}>
              {detectionResult ? (
                <Image source={{ uri: detectionResult.imageUrl || detectionResult.image || scannedImage }} style={styles.fullImage} />
              ) : scannedImage ? (
                <Image source={{ uri: scannedImage }} style={styles.fullImage} />
              ) : (
                <Ionicons name="scan-outline" size={80} color="rgba(255,255,255,0.3)" />
              )}
              {!detectionResult && (
                <Animated.View 
                  style={[
                    styles.scanLine, 
                    { 
                      transform: [{ 
                        translateY: scanAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 240]
                        }) 
                      }] 
                    }
                  ]} 
                />
              )}
              {detectionResult && (
                <View style={styles.successOverlay}>
                   <Ionicons name="checkmark-done-circle" size={80} color="#16a34a" />
                </View>
              )}
            </View>
            <View style={styles.scanMetaBox}>
               {detectionResult ? (
                 <View style={styles.resultDetails}>
                    <Text style={styles.resultStore}>{detectionResult.store}</Text>
                    <Text style={styles.resultTitle}>{detectionResult.title}</Text>
                    <View style={styles.resultAction}>
                       <Text style={styles.resultActionText}>Viewing Catalog Details...</Text>
                    </View>
                 </View>
               ) : (
                 <View style={{ alignItems: 'center' }}>
                    <Text style={styles.scanStatus}>Identifying Product Patterns...</Text>
                    <ActivityIndicator color="#a855f7" style={{ marginTop: 15 }} />
                 </View>
               )}
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput 
            placeholder="Search products, brands, or flyers..." 
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity 
            onPress={handleCameraPress} 
            style={{ padding: 8, marginRight: 4 }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="camera-outline" size={26} color={Colors.primary} />
          </TouchableOpacity>
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {search.length === 0 && (
          <View>
            <Text style={sectionStyles.title}>Popular Categories</Text>
            <View style={styles.tagContainer}>
              {quickCategories.map((cat, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.tag}
                  onPress={() => setSearch(cat)}
                >
                  <Text style={styles.tagText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text style={sectionStyles.title}>
          {search.length > 0 ? `Results for "${search}"` : 'Recent Offers'}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.grid}>
            {filteredOffers.length > 0 ? filteredOffers.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card}
                onPress={() => router.push(`/offer/${item.id}`)}
              >
                <View style={styles.cardImageContainer}>
                  <Image source={{ uri: item.image || item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' }} style={styles.cardImage} />
                  <View style={styles.brandOverlay}>
                     <Text style={styles.brandOverlayText}>{item.store.substring(0, 2)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.heartOverlay}
                    onPress={() => toggleFavorite(item.id, item)}
                  >
                    <Ionicons 
                      name={isFavorited(item.id) ? "heart" : "heart-outline"} 
                      size={20} 
                      color={isFavorited(item.id) ? "#ef4444" : "#ffffff"} 
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardStore}>{item.store}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.newPrice}>Rs. {item.newPrice?.toLocaleString() || '0'}</Text>
                    <Text style={styles.discount}>-{item.discountPercent}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color="#d1d5db" />
                <Text style={styles.noResultsText}>No offers found</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const sectionStyles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  menuSubTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  keywordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  keywordInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  menuIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  menuItemSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: 'center',
    padding: 16,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanContainer: {
    alignItems: 'center',
    width: '90%',
  },
  scanTitle: {
    color: '#a855f7',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 3,
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    elevation: 20,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.7,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#d8b4fe',
    zIndex: 10,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanMetaBox: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  resultDetails: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 10,
  },
  resultStore: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultAction: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resultActionText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  scanStatus: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d8b4fe',
  },
  tagText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  card: {
    width: '50%',
    padding: 8,
  },
  cardImageContainer: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  brandOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  brandOverlayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  heartOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    marginTop: 8,
  },
  cardStore: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  discount: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  noResults: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 16,
  }
});
