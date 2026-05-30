import { Tabs, useSegments, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { auth, db } from '../../src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import LoginScreen from './login';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Map route names to icons and labels
  const tabConfig: Record<string, { label: string; activeIcon: string; inactiveIcon: string }> = {
    home: { label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
    search: { label: 'Search', activeIcon: 'search', inactiveIcon: 'search-outline' },
    saved: { label: 'Saved', activeIcon: 'heart', inactiveIcon: 'heart-outline' },
    profile: { label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
  };

  const renderTab = (routeName: string) => {
    const routeIndex = state.routes.findIndex((r: any) => r.name === routeName);
    if (routeIndex === -1) return null;
    const isFocused = state.index === routeIndex;
    const config = tabConfig[routeName];

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[routeIndex].key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    };

    return isFocused ? (
      <View key={routeName} style={styles.activePill}>
        <Ionicons name={config.activeIcon as any} size={20} color="#FFFFFF" />
        <Text style={styles.activeLabel}>{config.label}</Text>
      </View>
    ) : (
      <TouchableOpacity key={routeName} onPress={onPress} style={styles.inactiveTab}>
        <Ionicons name={config.inactiveIcon as any} size={22} color="#a78bfa" />
        <Text style={styles.inactiveLabel}>{config.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {renderTab('home')}
      {renderTab('search')}
      
      {/* Scan Button (Center) */}
      <View style={styles.scanContainer}>
        <TouchableOpacity
          onPress={() => router.push('/offers/qr-scanner')}
          style={styles.scanButton}
        >
          <Ionicons name="scan-outline" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.inactiveLabel}>Scan</Text>
      </View>

      {renderTab('saved')}
      {renderTab('profile')}
    </View>
  );
}

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            console.log('👑 TabLayout detected admin session. Unlocking Admin Tab!');
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.warn('Error reading admin role in Tab layout:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);


  // Enforce active administrator containment bounds on tab navigations / back button actions
  useEffect(() => {
    if (isAdmin && segments.length > 0) {
      const currentTab = segments[segments.length - 1];
      if (['home', 'search', 'browse', 'saved', 'CartScreen', 'profile'].includes(currentTab)) {
        console.log(`🛡️ Admin containment warning: tried to access customer screen '${currentTab}'. Redirecting to Portal!`);
        router.replace('/(tabs)/admin');
      }
    }
  }, [isAdmin, segments]);

  return (
      <Tabs
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen
          name="home"
          options={{
            href: isAdmin ? null : '/home',
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            href: isAdmin ? null : '/search',
            title: 'Search',
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            href: isAdmin ? null : '/saved',
            title: 'Saved',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: isAdmin ? null : '/profile',
            title: 'Profile',
          }}
        />
        <Tabs.Screen
          name="CartScreen"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="payment"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="cards"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="checkout"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            href: null,
          }}
        />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#140028', // Deep purple matching the theme
    borderTopWidth: 1,
    borderTopColor: '#2d1155', // Subtle top border
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  activePill: {
    flexDirection: 'row',
    backgroundColor: '#34105C', // Dark purple active pill background
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 6,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 50,
  },
  inactiveLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  scanContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24, // Float/raise scan button
  },
  scanButton: {
    backgroundColor: '#7B2CFF', // Vibrant purple
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B2CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#140028', // Dark border matching bar background
  },
});
