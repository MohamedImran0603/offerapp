import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const categoriesData = [
  {
    title: 'Electronics',
    icon: 'desktop-outline',
    subcategories: [
      'Mobiles', 'TV', 'Kitchen Appliance', 'Printer', 'Smart Watch', 
      'Computer & Laptop', 'Tabs', 'Monitors & Projectors', 
      'Large Appliances', 'Accessories', 'Small Appliances', 'Camera', 'Gaming'
    ]
  },
  {
    title: 'Food - Grocery',
    icon: 'cart-outline',
    subcategories: [
      'Rice', 'Oil & Ghee', 'Canned & Packeted', 'Flour & Baking', 
      'Sauces & Spreads', 'Pasta & Noodles', 'Cereals & Bars', 
      'Salts, Spices & Paste', 'Sugar & Sweetener', 'Pulses, Beans & Grains'
    ]
  },
  {
    title: 'Fruits & Vegetable',
    icon: 'leaf-outline',
    subcategories: ['Fresh Vegetables', 'Fresh Fruits']
  },
  { title: 'Dairy & Eggs', icon: 'egg-outline', subcategories: [] },
  { title: 'Chicken, Meat & Fish', icon: 'restaurant-outline', subcategories: [] },
  { title: 'Frozen Food', icon: 'snow-outline', subcategories: [] },
  { title: 'Drinks & Beverages', icon: 'wine-outline', subcategories: [] },
  { title: 'Bakery & Confectionary', icon: 'pizza-outline', subcategories: [] },
  { title: 'Health & Beauty', icon: 'heart-outline', subcategories: [] },
  { title: 'Baby & Mom Care', icon: 'baby-outline', subcategories: [] },
  { title: 'Laundry & Cleaning', icon: 'water-outline', subcategories: [] },
  { title: 'Tissue & Disposables', icon: 'paper-plane-outline', subcategories: [] },
  { title: 'Home & Lifestyle', icon: 'home-outline', subcategories: [] },
  { title: 'Clothing & Apparels', icon: 'shirt-outline', subcategories: [] },
];

export default function BrowseScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (title: string) => {
    setExpanded(expanded === title ? null : title);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Categories</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput placeholder="Search categories..." style={styles.searchInput} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>All Categories</Text>
        
        {categoriesData.map((item, index) => (
          <View key={index} style={styles.categoryCard}>
            <TouchableOpacity 
              style={styles.categoryHeader} 
              onPress={() => toggleExpand(item.title)}
            >
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.categoryTitle}>{item.title}</Text>
              </View>
              {item.subcategories.length > 0 && (
                <Ionicons 
                  name={expanded === item.title ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9ca3af" 
                />
              )}
            </TouchableOpacity>

            {expanded === item.title && item.subcategories.length > 0 && (
              <View style={styles.subContainer}>
                {item.subcategories.map((sub, idx) => (
                  <TouchableOpacity key={idx} style={styles.subItem}>
                    <Text style={styles.subText}>{sub}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#d1d5db" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subContainer: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  subText: {
    fontSize: 15,
    color: '#4b5563',
  }
});
