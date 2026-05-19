import { Tabs, useSegments, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Colors } from '../../src/constants/Colors';
import { Text } from 'react-native';
import { auth, db } from '../../src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
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
      if (['home', 'search', 'browse', 'saved'].includes(currentTab)) {
        console.log(`🛡️ Admin containment warning: tried to access customer screen '${currentTab}'. Redirecting to Portal!`);
        router.replace('/(tabs)/admin');
      }
    }
  }, [isAdmin, segments]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9ca3af',

        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          href: isAdmin ? null : '/home',
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: isAdmin ? null : '/search',
          title: 'Search',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          href: isAdmin ? null : '/browse',
          title: 'Browse',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📖</Text>,
          title: 'Categories',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📁</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          href: isAdmin ? null : '/saved',
          title: 'Saved',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>❤️</Text>,
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
    </Tabs>
  );
}
