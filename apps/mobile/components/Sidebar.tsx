import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/Colors';

const menuItems = [
  { label: 'Home', route: '/home' },
  { label: 'Search', route: '/search' },
  { label: 'Browse', route: '/browse' },
  { label: 'Saved', route: '/saved' },
  { label: 'Profile', route: '/profile' },
  { label: 'Admin', route: '/admin' },
];

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const handleNavigate = (route: string) => {
    router.replace(route);
    onClose();
  };

  return (
    <View style={styles.container}>
      {menuItems.map(item => (
        <TouchableOpacity
          key={item.route}
          style={styles.item}
          onPress={() => handleNavigate(item.route)}
        >
          <Text style={styles.itemText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e8ff', // soft pastel background
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9d5ff',
  },
  itemText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },
});
