import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/Colors';

export default function PhotoSearchScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo search</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Camera Preview Placeholder */}
        <View style={styles.cameraContainer}>
           <View style={styles.cameraBox}>
              <Text style={{ fontSize: 48, color: '#9ca3af' }}>📷</Text>
           </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📸</Text>
              <Text style={styles.actionText}>Take photo</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>Upload image</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.actionButton, styles.scanActive]}>
              <Text style={styles.actionIcon}>🔳</Text>
              <Text style={styles.actionText}>Scan</Text>
           </TouchableOpacity>
        </View>

        {/* AI Detection Result */}
        <View style={styles.aiSection}>
           <Text style={styles.aiLabel}>AI detected:</Text>
           <Text style={styles.detectedObject}>Milo Chocolate Tin 400g</Text>
           <View style={styles.confidenceContainer}>
              <View style={styles.confidenceBar}>
                 <View style={[styles.confidenceFill, { width: '94%' }]} />
              </View>
              <Text style={styles.confidenceText}>Confidence: <Text style={{ color: Colors.primary }}>94%</Text> · Nestle brand</Text>
           </View>
        </View>

        {/* Matching Offers */}
        <View style={styles.matchesHeader}>
           <Text style={styles.matchesTitle}>Matching offers</Text>
           <Text style={styles.matchesCount}>3 found</Text>
        </View>

        <View style={styles.matchesList}>
           {[
             { title: 'Milo 400g Tin', store: 'Keells', distance: '1.2 km', price: 680, discount: 18 },
             { title: 'Milo 400g Tin', store: 'Cargills', distance: '2.0 km', price: 730, discount: 12 },
           ].map((item, idx) => (
             <TouchableOpacity key={idx} style={styles.matchCard}>
                <View style={styles.matchIconContainer}>
                   <Text style={{ fontSize: 24 }}>📦</Text>
                </View>
                <View style={styles.matchInfo}>
                   <Text style={styles.matchTitle}>{item.title}</Text>
                   <Text style={styles.matchSub}>{item.store} — {item.distance} away</Text>
                </View>
                <View style={styles.matchPriceContainer}>
                   <View style={styles.matchDiscount}>
                      <Text style={styles.matchDiscountText}>-{item.discount}%</Text>
                   </View>
                   <Text style={styles.matchPrice}>Rs. {item.price}</Text>
                </View>
             </TouchableOpacity>
           ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cameraContainer: {
    padding: 20,
  },
  cameraBox: {
    width: '100%',
    height: 240,
    backgroundColor: '#111827',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  scanActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#d1fae5',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  aiSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  aiLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detectedObject: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  confidenceContainer: {
    gap: 8,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6b7280',
  },
  matchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  matchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  matchesCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  matchesList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 40,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  matchIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchInfo: {
    flex: 1,
    marginLeft: 16,
  },
  matchTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  matchSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  matchPriceContainer: {
    alignItems: 'flex-end',
  },
  matchDiscount: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  matchDiscountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  matchPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  }
});
