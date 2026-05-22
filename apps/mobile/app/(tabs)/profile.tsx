import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { subscribeToFavorites } from '../../src/lib/userService';
import { auth, db } from '../../src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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
            setCurrentUser({ uid: user.uid, username: user.email?.split('@')[0] || 'User', email: user.email, district: 'Colombo' });
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

  const menuItems = [
    { label: 'Followed Stores', icon: 'storefront-outline', color: '#6b21a8', value: '12' },
    { label: 'My Transactions', icon: 'receipt-outline', color: '#6b21a8' },
    { label: 'Refer & Earn', icon: 'share-social-outline', color: '#6b21a8', value: 'Earn Coins' },
    { label: 'Notifications', icon: 'notifications-outline', color: '#6b21a8', route: '/notifications' },
    { label: 'Help & Support', icon: 'help-circle-outline', color: '#6b21a8' },
    { label: 'Language', icon: 'globe-outline', color: '#6b21a8', value: 'English' },
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
          <TouchableOpacity style={styles.profileCard}>
            <View style={styles.profileInfoRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color="#ccc" />
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{currentUser?.username || 'Guest'}</Text>
                <Text style={styles.profilePhone}>{currentUser?.phone || '+94 77 123 4567'}</Text>
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
            <Text style={styles.walletValue}>Rs. 2,450.00</Text>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletCol}>
            <Text style={styles.walletLabel}>Coins</Text>
            <View style={styles.coinsRow}>
              <Ionicons name="server" size={16} color="#fbbf24" style={{ marginRight: 4 }} />
              <Text style={styles.walletValue}>2,450</Text>
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
            <Text style={styles.activityValue}>{savedCount || 24}</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="eye" size={20} color="#22c55e" />
            </View>
            <Text style={styles.activityLabel}>Viewed</Text>
            <Text style={styles.activityValue}>58</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="ticket" size={20} color="#a855f7" />
            </View>
            <Text style={styles.activityLabel}>My Coupons</Text>
            <Text style={styles.activityValue}>12</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="star" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.activityLabel}>Reviews</Text>
            <Text style={styles.activityValue}>7</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.menuItem}
              onPress={() => item.route && router.push(item.route as any)}
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
          onPress={() => router.replace('/login')}
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
    backgroundColor: '#faf5ff',
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
