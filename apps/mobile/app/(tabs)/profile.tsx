import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { subscribeToFavorites } from '../../src/lib/userService';
import { auth, db, storage } from '../../src/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const unsub = subscribeToFavorites((favs) => {
      setSavedCount(favs.length);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser({ uid: user.uid, ...userDoc.data() });
          } else {
            setCurrentUser({ uid: user.uid, name: user.email?.split('@')[0] || 'User', email: user.email, district: 'Colombo' });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoadingUser(false);
    });

    return () => {
      unsub();
      unsubscribeAuth();
    };
  }, []);

  const pickImage = async () => {
    if (!currentUser) return;
    
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        // Show local preview immediately
        setCurrentUser((prev: any) => ({ ...prev, profilePic: uri }));
        setIsUploadingImage(true);
        
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          
          const uploadTask = async () => {
            // Upload to Firebase Storage
            const imageRef = ref(storage, `profilePics/${currentUser.uid}-${Date.now()}`);
            await uploadBytes(imageRef, blob);
            const downloadURL = await getDownloadURL(imageRef);
            
            // Update Firestore with remote URL
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { profilePic: downloadURL });
            
            // Update local state with remote URL
            setCurrentUser((prev: any) => ({ ...prev, profilePic: downloadURL }));
          };

          // Race the upload against a 5-second timeout
          await Promise.race([
            uploadTask(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timeout")), 5000))
          ]);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Keep the local preview even if upload fails
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to pick image. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out');
    }
  };

  const handleMenuPress = (item: any) => {
    if (item.route) {
      router.push(item.route);
    } else {
      alert(`${item.label} feature is coming soon!`);
    }
  };

  const menuItems = [
    { label: 'Followed Stores', icon: 'storefront-outline', color: '#6b21a8', value: '12' },
    { label: 'My Transactions', icon: 'receipt-outline', color: '#6b21a8' },
    { label: 'Refer & Earn', icon: 'share-social-outline', color: '#6b21a8', value: 'Earn Coins' },
    { label: 'Notifications', icon: 'notifications-outline', color: '#6b21a8', route: '/notifications' },
    { label: 'Help & Support', icon: 'help-circle-outline', color: '#6b21a8' },
    { label: 'My Cards', icon: 'card-outline', color: '#6b21a8', route: '/cards' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}>
        
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => router.push('/admin')}>
            <Ionicons name="settings-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Purple Profile Card */}
        {isLoadingUser ? (
          <View style={[styles.profileCard, { justifyContent: 'center', alignItems: 'center', height: 100 }]}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          <TouchableOpacity style={styles.profileCard} onPress={pickImage}>
            <View style={styles.profileInfoRow}>
              <View style={styles.avatar}>
                <View style={styles.avatarImageWrapper}>
                  {currentUser?.profilePic ? (
                    <Image source={{ uri: currentUser.profilePic }} style={{ width: 64, height: 64, borderRadius: 32 }} />
                  ) : (
                    <Ionicons name="person" size={32} color="#ccc" />
                  )}
                  {isUploadingImage && (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' }]}>
                      <ActivityIndicator size="small" color="#6b21a8" />
                    </View>
                  )}
                </View>
                <View style={styles.cameraIconBadge}>
                  <Ionicons name="camera" size={12} color="#fff" />
                </View>
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{currentUser?.name || 'Guest'}</Text>
                <Text style={styles.profilePhone}>{currentUser?.phone || 'No phone number'}</Text>
                <Text style={styles.profileEmail}>{currentUser?.email || 'No email'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" style={{ opacity: 0.7 }} />
            </View>
          </TouchableOpacity>
        )}

        {/* My Wallet */}
        <Text style={styles.sectionTitle}>My Wallet</Text>
        <View style={styles.walletCard}>
          <View style={styles.walletCol}>
            <Text style={styles.walletLabel}>Balance</Text>
            <Text style={styles.walletValue}>Rs. {currentUser?.balance ? Number(currentUser.balance).toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletCol}>
            <Text style={styles.walletLabel}>Coins</Text>
            <View style={styles.coinsRow}>
              <Ionicons name="server" size={16} color="#fbbf24" style={{ marginRight: 4 }} />
              <Text style={styles.walletValue}>{currentUser?.coins || '0'}</Text>
            </View>
          </View>
        </View>

        {/* My Activity */}
        <Text style={styles.sectionTitle}>My Activity</Text>
        <View style={styles.activityRow}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="heart" size={20} color="#ef4444" />
            </View>
            <Text style={styles.activityLabel}>Saved Offers</Text>
            <Text style={styles.activityValue}>{savedCount || 0}</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="eye" size={20} color="#22c55e" />
            </View>
            <Text style={styles.activityLabel}>Viewed</Text>
            <Text style={styles.activityValue}>{currentUser?.viewedCount || 0}</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="ticket" size={20} color="#a855f7" />
            </View>
            <Text style={styles.activityLabel}>My Coupons</Text>
            <Text style={styles.activityValue}>{currentUser?.couponsCount || 0}</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="star" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.activityLabel}>Reviews</Text>
            <Text style={styles.activityValue}>{currentUser?.reviewsCount || 0}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
            >
              <Ionicons name={item.icon as any} size={20} color={item.color} style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ))}

          {/* Dark Mode Toggle */}
          <View style={styles.menuItem}>
            <Ionicons name="moon-outline" size={20} color="#6b21a8" style={styles.menuIcon} />
            <Text style={styles.menuLabel}>Dark Mode</Text>
            <Switch 
              value={isDarkMode} 
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#f3f4f6', true: '#6b21a8' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutBtn}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileCard: {
    backgroundColor: '#6b21a8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    position: 'relative',
  },
  avatarImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#374151',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profilePhone: {
    color: '#e9d5ff',
    fontSize: 12,
    marginBottom: 2,
  },
  profileEmail: {
    color: '#e9d5ff',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  walletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  walletCol: {
    flex: 1,
  },
  walletDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  walletLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  walletValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  activityItem: {
    alignItems: 'center',
    flex: 1,
  },
  activityIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 4,
    textAlign: 'center',
  },
  activityValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  menuValue: {
    fontSize: 13,
    color: '#9ca3af',
  },
  signOutBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
