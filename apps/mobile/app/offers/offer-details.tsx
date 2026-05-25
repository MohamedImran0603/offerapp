import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockData } from '../../src/lib/mockData';
import { auth } from '../../src/lib/firebase';

const { width } = Dimensions.get('window');

export default function OfferDetailsScreen() {
  const router = useRouter();

  // Use a mock offer for the details template
  const offer = mockData[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (Overlay) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: offer.image }} style={styles.mainImage} />
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>15% OFF</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.storeName}>{offer.store}</Text>
          <Text style={styles.title}>{offer.title}</Text>
          
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text style={styles.tagText}>Valid till Oct 31</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text style={styles.tagText}>In-Store Only</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this offer</Text>
          <View style={styles.aboutBox}>
            <Text style={styles.aboutText}>
              Get {offer.title} at an exclusive discount. Present this offer at any participating {offer.store} outlet to claim your discount.
            </Text>
          </View>
        </View>

        {/* T&C Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Valid only for loyal customers.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Cannot be combined with other ongoing promotions.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Subject to availability at participating outlets.</Text>
          </View>
        </View>

        {/* How to Redeem */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Redeem</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepCircle}><Text style={styles.stepNumber}>1</Text></View>
            <Text style={styles.stepText}>Save this offer or take a screenshot.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepCircle}><Text style={styles.stepNumber}>2</Text></View>
            <Text style={styles.stepText}>Visit any {offer.store} near you.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepCircle}><Text style={styles.stepNumber}>3</Text></View>
            <Text style={styles.stepText}>Show the barcode/QR code at checkout.</Text>
          </View>
        </View>

        <View style={{ height: 100 }} /> {/* Padding for bottom bar */}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn}>
          <Ionicons name="bookmark-outline" size={20} color="#111827" />
          <Text style={styles.saveBtnText}>Save for Later</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => {
            if (auth.currentUser) {
              router.push('/offers/qr-scanner');
            } else {
              // Redirect to login if guest
              router.push('/login');
            }
          }}
        >
          <Text style={styles.primaryBtnText}>Use Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    bottom: -16,
    right: 24,
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  discountBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoSection: {
    padding: 24,
    paddingTop: 32,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7e22ce',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 32,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  aboutBox: {
    backgroundColor: '#faf5ff',
    padding: 16,
    borderRadius: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
    gap: 16,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: '#7e22ce',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
