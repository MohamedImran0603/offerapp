import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/Colors';

const filters = ['All', 'Deals', 'Expiring', 'Nearby'];

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');

  const notifications = [
    {
      id: '1',
      title: 'Keells has 12 new offers today!',
      desc: 'New arrivals in Grocery & Fresh produce',
      time: '2 min ago',
      icon: '✨',
      color: '#ecfdf5',
      type: 'Deals'
    },
    {
      id: '2',
      title: 'Your saved offer expires in 24 hours',
      desc: 'Organic Veg Pack — Keells Colombo 3',
      time: '1 hour ago',
      icon: '🕒',
      color: '#fff1f2',
      type: 'Expiring'
    },
    {
      id: '3',
      title: '3 offers near you right now',
      desc: 'Cargills within 500m — check deals',
      time: '3 hours ago',
      icon: '📍',
      color: '#eff6ff',
      type: 'Nearby'
    },
    {
      id: '4',
      title: 'Price drop on Samsung A35',
      desc: 'Now Rs. 56,990 — was Rs. 71,990',
      time: 'Yesterday',
      icon: '🏷️',
      color: '#fff7ed',
      type: 'Deals'
    }
  ];

  const filteredNotifications = activeFilter === 'All' 
    ? notifications 
    : notifications.filter(n => n.type === activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3 new</Text>
        </View>
      </View>

      {/* Filters */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((f, idx) => (
            <TouchableOpacity 
              key={idx} 
              onPress={() => setActiveFilter(f)}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {filteredNotifications.map((n) => (
          <TouchableOpacity key={n.id} style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: n.color }]}>
              <Text style={{ fontSize: 20 }}>{n.icon}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{n.title}</Text>
              <Text style={styles.cardDesc}>{n.desc}</Text>
              <Text style={styles.cardTime}>{n.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  badgeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  }
});
