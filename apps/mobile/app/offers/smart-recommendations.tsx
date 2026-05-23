import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockData } from '../../src/lib/mockData';

const { width } = Dimensions.get('window');

export default function SmartRecommendationsScreen() {
  const router = useRouter();

  // Get some mock recommendations
  const recommendations = mockData.slice(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart For You</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Hero Banner */}
            <View style={styles.heroBanner}>
              <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                  <Ionicons name="sparkles" size={14} color="#a855f7" />
                  <Text style={styles.heroBadgeText}>AI Powered</Text>
                </View>
                <Text style={styles.heroTitle}>Your personalized daily picks</Text>
                <Text style={styles.heroSub}>Based on your recent shopping behavior</Text>
              </View>
              <View style={styles.heroIconBox}>
                <Ionicons name="hardware-chip-outline" size={48} color="#ffffff" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recommended For You</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/offer/${item.id}`)}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardStore}>{item.store}</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.newPrice}>Rs. {item.offerPrices ? item.offerPrices[10] || item.oldPrice : item.oldPrice}</Text>
                {item.oldPrice && <Text style={styles.oldPrice}>Rs. {item.oldPrice}</Text>}
              </View>
            </View>
            <TouchableOpacity style={styles.saveButton}>
              <Ionicons name="bookmark-outline" size={20} color="#6b21a8" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
            <Text style={styles.infoText}>
              Recommendations update daily based on your views, saves, and location.
            </Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  filterButton: {
    padding: 8,
    marginRight: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#7e22ce',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    marginRight: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7e22ce',
    marginLeft: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: '#d8b4fe',
    lineHeight: 18,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cardStore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7e22ce',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  oldPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  saveButton: {
    padding: 8,
    justifyContent: 'flex-start',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginLeft: 12,
  },
});
