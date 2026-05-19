import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { subscribeToFavorites } from '../../src/lib/userService';

import * as WebBrowser from 'expo-web-browser';

export default function ProfileScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToFavorites((favs) => {
      setSavedCount(favs.length);
    });
    return () => unsub();
  }, []);

  const openAdminDashboard = () => {
    router.push('/admin');
  };

  const menuItems = [
    { label: 'Notifications', icon: '🔔', route: '/notifications' },
    { label: 'Location & district', icon: '📍', value: 'Colombo' },
    { label: 'Language', icon: '🌐', value: 'English' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Section */}
        <View style={styles.header}>
           <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                 <Text style={styles.avatarIcon}>👤</Text>
              </View>
           </View>
           <Text style={styles.userName}>Ravindu Perera</Text>
           <Text style={styles.userSub}>ravindu@gmail.com · Colombo</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
           <View style={styles.statCard}>
              <Text style={styles.statNumber}>{savedCount || 24}</Text>
              <Text style={styles.statLabel}>Saved offers</Text>
           </View>
           <View style={styles.statCard}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Fav. stores</Text>
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
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>
                  {item.label}
                  {item.value && <Text style={styles.menuValue}> · {item.value}</Text>}
                </Text>
                <Text style={styles.chevron}>›</Text>
             </TouchableOpacity>
           ))}

           {/* Dark Mode Toggle */}
           <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>🌙</Text>
              <Text style={styles.menuLabel}>Dark mode</Text>
              <Switch 
                value={isDarkMode} 
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#f3f4f6', true: Colors.primary }}
                thumbColor="#ffffff"
              />
           </View>

           {/* Privacy Settings */}
           <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>🛡️</Text>
              <Text style={styles.menuLabel}>Privacy settings</Text>
              <Text style={styles.chevron}>›</Text>
           </TouchableOpacity>

           {/* Admin Dashboard Portal */}
           <TouchableOpacity 
             style={[styles.menuItem, { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f9fafb' }]}
             onPress={openAdminDashboard}
           >
              <View style={{ backgroundColor: '#fee2e2', padding: 6, borderRadius: 8, marginRight: 16 }}>
                 <Text style={{ fontSize: 16 }}>⚙️</Text>
              </View>
              <Text style={[styles.menuLabel, { color: '#dc2626', fontWeight: 'bold' }]}>Admin Dashboard</Text>
              <Text style={styles.chevron}>›</Text>
           </TouchableOpacity>

           {/* Sign Out */}
           <TouchableOpacity 
             style={[styles.menuItem, { marginTop: 4 }]}
             onPress={() => router.replace('/register')}
           >
              <Text style={[styles.menuIcon, { color: '#ef4444' }]}>↩️</Text>
              <Text style={[styles.menuLabel, { color: '#ef4444' }]}>Sign out</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#ecfdf5',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarIcon: {
    fontSize: 40,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userSub: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  menuValue: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  chevron: {
    fontSize: 20,
    color: '#d1d5db',
  }
});
