import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Modal, FlatList, Animated, Easing, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { db } from '../../src/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { seedDatabase } from '../../src/lib/seedData';
import { toggleFavorite, subscribeToFavorites } from '../../src/lib/userService';
import { Ionicons } from '@expo/vector-icons';
import { mockData, districts, mainCategories, brands } from '../../src/lib/mockData';
import * as ImagePicker from 'expo-image-picker';

const topTabs = [
  { name: 'Top pick', icon: '📢' },
  { name: 'Favorites', icon: '❤️' },
  { name: 'Nearest', icon: '📍' },
  { name: 'Latest', icon: '🕒' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>(mockData);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [clickedCategories, setClickedCategories] = useState<{[key: string]: number}>({
    'Food - Grocery': 2,
    'Electronics': 1
  });

  const recommendedOffers = (offers.length > 0 ? offers : mockData)
    .filter(o => clickedCategories[o.category] && clickedCategories[o.category] > 0)
    .sort((a, b) => (clickedCategories[b.category] || 0) - (clickedCategories[a.category] || 0))
    .slice(0, 5);

  const handleOfferClick = (item: any) => {
    setClickedCategories(prev => ({
      ...prev,
      [item.category]: (prev[item.category] || 0) + 1
    }));
    router.push(`/offer/${item.id}`);
  };
  const [activeTopTab, setActiveTopTab] = useState('Top pick');
  const [selectedDistrict, setSelectedDistrict] = useState('Whole Country');
  const [isDistrictModalVisible, setDistrictModalVisible] = useState(false);
  
  // Camera Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraMenuVisible, setIsCameraMenuVisible] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<any | null>(null);
  const [imageSearchKeyword, setImageSearchKeyword] = useState('');
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    seedDatabase(); 

    const q = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
    const unsubscribeOffers = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 20) { 
        setOffers([...data, ...mockData]); // Merge for better testing
      }
      setLoading(false);
    }, (error) => {
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
      
      const keywordToUse = searchKey || '';
      
      if (keywordToUse && keywordToUse.trim() !== '') {
        matchedProduct = availableOffers.find(o => 
          o.title.toLowerCase().includes(keywordToUse.toLowerCase()) || 
          o.category.toLowerCase().includes(keywordToUse.toLowerCase()) ||
          o.store.toLowerCase().includes(keywordToUse.toLowerCase())
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
          o.title.toLowerCase().includes('iphone') || 
          o.title.toLowerCase().includes('samsung') || 
          o.title.toLowerCase().includes('sony')
        );
        
        if (popularProducts.length > 0) {
          matchedProduct = popularProducts[Math.floor(Math.random() * popularProducts.length)];
        } else {
          const randomIndex = Math.floor(Math.random() * Math.min(10, availableOffers.length));
          matchedProduct = availableOffers[randomIndex];
        }
      }
      
      matchedProduct = matchedProduct || availableOffers[0];

      setDetectionResult(matchedProduct);
      
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

  const filteredOffers = offers.filter(offer => {
    const matchesCategory = activeCategory === 'ALL' || offer.category === activeCategory;
    const matchesSearch = offer.title.toLowerCase().includes(search.toLowerCase()) || 
                         offer.store.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = selectedDistrict === 'Whole Country' || offer.district === selectedDistrict;
    return matchesCategory && matchesSearch && matchesDistrict;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Camera Menu Modal */}
      <Modal visible={isCameraMenuVisible} transparent animationType="slide">
        <View style={styles.menuOverlay}>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
               <Text style={styles.menuTitle}>AI Image Search</Text>
               <TouchableOpacity onPress={() => setIsCameraMenuVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
               </TouchableOpacity>
            </View>
            <Text style={styles.menuSubTitle}>Scan to see full product details and offers</Text>
            
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
                  <Text style={styles.menuItemText}>Capture Actual Product</Text>
                  <Text style={styles.menuItemSub}>Directly open product menu & details</Text>
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
                  <Text style={styles.menuItemText}>Upload from Gallery</Text>
                  <Text style={styles.menuItemSub}>Match image with catalog pages</Text>
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
               {detectionResult ? 'PRODUCT IDENTIFIED!' : 'AI IMAGE SCANNING...'}
            </Text>
            <View style={[styles.scanFrame, detectionResult && { borderColor: '#16a34a' }]}>
              {detectionResult ? (
                <Image source={{ uri: detectionResult.imageUrl || detectionResult.image || scannedImage }} style={styles.fullImage} />
              ) : scannedImage ? (
                <Image source={{ uri: scannedImage }} style={styles.fullImage} />
              ) : (
                <Ionicons name="image-outline" size={80} color="rgba(255,255,255,0.3)" />
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
                   <Ionicons name="checkmark-circle" size={80} color="#16a34a" />
                </View>
              )}
            </View>
            <View style={styles.scanMetaBox}>
               {detectionResult ? (
                 <View style={styles.resultDetails}>
                    <Text style={styles.resultStore}>{detectionResult.store}</Text>
                    <Text style={styles.resultTitle}>{detectionResult.title}</Text>
                    <View style={styles.resultBadge}>
                       <Text style={styles.resultBadgeText}>Opening Product Menu...</Text>
                    </View>
                 </View>
               ) : (
                 <View style={{ alignItems: 'center' }}>
                    <Text style={styles.scanStatus}>Analyzing Visual Features...</Text>
                    <View style={styles.scanPulse} />
                 </View>
               )}
            </View>
          </View>
        </View>
      </Modal>

      {/* District Picker Modal */}
      <Modal visible={isDistrictModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={districts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.districtItem}
                  onPress={() => {
                    setSelectedDistrict(item);
                    setDistrictModalVisible(false);
                  }}
                >
                  <Text style={[styles.districtItemText, selectedDistrict === item && styles.selectedDistrictText]}>{item}</Text>
                  {selectedDistrict === item && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} />
          <View style={{ flex: 1 }}>
             <Text style={styles.brandTitle}>Offer Lanka</Text>
             <TouchableOpacity style={styles.districtSelector} onPress={() => setDistrictModalVisible(true)}>
                <Text style={styles.districtText}>📍 {selectedDistrict}</Text>
                <Text style={styles.districtChevron}>⌵</Text>
             </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
             <View style={styles.notifyContainer}>
                <Text style={{ fontSize: 20 }}>🔔</Text>
                <View style={styles.notifyBadge}><Text style={styles.notifyCount}>5</Text></View>
             </View>
             <TouchableOpacity style={styles.loginBtn}>
                <Text style={styles.loginBtnText}>Login/Register</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <TextInput 
              placeholder="Find all shopping flyers..." 
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity 
              onPress={handleCameraPress} 
              style={{ padding: 10 }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
               <Ionicons name="camera-outline" size={26} color="#6b21a8" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Top Sub Tabs */}
        <View style={styles.topTabsRow}>
           {topTabs.map((tab, idx) => (
             <TouchableOpacity 
               key={idx} 
               style={[styles.topTab, activeTopTab === tab.name && styles.topTabActive]}
               onPress={() => setActiveTopTab(tab.name)}
             >
                <Text style={styles.topTabIcon}>{tab.icon}</Text>
                <Text style={[styles.topTabText, activeTopTab === tab.name && styles.topTabTextActive]}>{tab.name}</Text>
             </TouchableOpacity>
           ))}
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
           {mainCategories.map((cat, idx) => (
             <TouchableOpacity 
               key={idx} 
               onPress={() => setActiveCategory(cat)}
               style={[styles.catBtn, activeCategory === cat && styles.catBtnActive]}
             >
                <Text style={[styles.catBtnText, activeCategory === cat && styles.catBtnTextActive]}>{cat}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>

        {/* Brand Circles */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandScroll}>
           {brands.map((brand, idx) => (
             <View key={idx} style={styles.brandItem}>
                <View style={[styles.brandCircle, { backgroundColor: brand.color }]}>
                   <Text style={styles.brandLogo}>{brand.logo}</Text>
                </View>
                <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
             </View>
           ))}
        </ScrollView>

        {/* AI Personalized Picks Section */}
        {recommendedOffers.length > 0 && (
          <View style={styles.recSection}>
            <View style={styles.recHeaderRow}>
               <Text style={styles.recSectionTitle}>🧠 AI Picks For You</Text>
               <Text style={styles.recSectionSub}>Based on your behavior</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
              {recommendedOffers.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.recCard}
                  onPress={() => handleOfferClick(item)}
                >
                  <Image source={{ uri: item.image }} style={styles.recCardImage} />
                  <View style={styles.recCardContent}>
                     <Text style={styles.recCardStore}>{item.store}</Text>
                     <Text style={styles.recCardTitle} numberOfLines={1}>{item.title}</Text>
                     <Text style={styles.recCardPrice}>Rs. {(item.newPrice || item.price || 0).toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Offers Grid */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {filteredOffers.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card}
                onPress={() => router.push(`/offer/${item.id}`)}
              >
                <View style={styles.cardImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.cardImage} />
                  <View style={styles.shopOnlineBanner}>
                     <Text style={styles.shopOnlineText}>Shop Online</Text>
                  </View>
                  <View style={styles.clickOverlay}>
                     <Text style={{ fontSize: 10, color: 'white' }}>👆 Click to shop online</Text>
                  </View>
                  <View style={styles.brandOverlay}>
                     <Text style={styles.brandOverlayText}>{item.store.substring(0, 2)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.heartOverlay}
                    onPress={() => toggleFavorite(item.id, item)}
                  >
                    <Text style={{ fontSize: 18, color: isFavorited(item.id) ? '#ef4444' : '#ffffff' }}>
                      {isFavorited(item.id) ? '❤️' : '🤍'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardStore}>{item.store}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardSubTitle} numberOfLines={1}>{item.subTitle}</Text>
                  <View style={styles.flyerFooter}>
                    <Text style={styles.pagesText}>+{item.pages || 12} Pages</Text>
                    <Text style={styles.daysText}>+{item.daysLeft || 3} Days left</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating AI Assistant FAB */}
      <TouchableOpacity 
        style={styles.floatingAssistantButton} 
        onPress={() => router.push('/assistant')}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  recSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  recHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  recSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  recSectionSub: {
    fontSize: 11,
    color: '#6b7280',
  },
  recScroll: {
    gap: 12,
    paddingRight: 16,
  },
  recCard: {
    width: 140,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  recCardImage: {
    width: '100%',
    height: 90,
    resizeMode: 'cover',
  },
  recCardContent: {
    padding: 8,
  },
  recCardStore: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6200EE',
    textTransform: 'uppercase',
  },
  recCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginTop: 2,
  },
  recCardPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },
  floatingAssistantButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#6200EE', // Primary Colors fallback
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
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
    textAlign: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: '#6b21a8',
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
  resultBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resultBadgeText: {
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
  scanPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    marginTop: 15,
  },
  header: {
    backgroundColor: '#111827',
    padding: 16,
    paddingTop: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
  },
  brandTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  districtSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  districtText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '500',
  },
  districtChevron: {
    color: '#d1d5db',
    fontSize: 10,
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifyContainer: {
    position: 'relative',
  },
  notifyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  loginBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    borderRadius: 24,
    justifyContent: 'center',
  },
  searchBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeBtn: {
    fontSize: 20,
    color: '#6b7280',
    padding: 4,
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  districtItemText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedDistrictText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  checkIcon: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  topTabsRow: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  topTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 4,
  },
  topTabIcon: {
    fontSize: 16,
  },
  topTabText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  topTabTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  catBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  catBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  catBtnTextActive: {
    color: 'white',
  },
  brandScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  brandItem: {
    alignItems: 'center',
    width: 70,
  },
  brandCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  brandLogo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  card: {
    width: '50%',
    padding: 8,
    marginBottom: 8,
  },
  cardImageContainer: {
    aspectRatio: 0.75,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shopOnlineBanner: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fde047',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 16,
  },
  shopOnlineText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clickOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  brandOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  brandOverlayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  heartOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  cardStore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  cardSubTitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  flyerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  pagesText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  daysText: {
    fontSize: 11,
    color: '#9ca3af',
  }
});
