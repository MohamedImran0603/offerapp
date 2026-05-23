import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { mockData } from '../../src/lib/mockData';

const { width } = Dimensions.get('window');

export default function QRScannerScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'qr' | 'coupon'>('qr');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Some mock recent scans
  const recentScans = mockData.slice(5, 7);

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Camera Permission</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="camera-outline" size={64} color="#6b7280" style={{ marginBottom: 16 }} />
          <Text style={{ textAlign: 'center', marginBottom: 24, fontSize: 16, color: '#4b5563' }}>We need your permission to access the camera for scanning QR codes.</Text>
          <TouchableOpacity onPress={requestPermission} style={{ paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#7e22ce', borderRadius: 12 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string, data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    alert(`Payment QR Scanned!\nNavigating to Checkout...`);
    
    // Simulate processing time
    setTimeout(() => {
      router.push('/payment');
      setScanned(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan & Save</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'qr' && styles.tabButtonActive]}
          onPress={() => setActiveTab('qr')}
        >
          <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>QR Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'coupon' && styles.tabButtonActive]}
          onPress={() => setActiveTab('coupon')}
        >
          <Text style={[styles.tabText, activeTab === 'coupon' && styles.tabTextActive]}>Coupon Code</Text>
        </TouchableOpacity>
      </View>

      {/* Mock Camera Area */}
      <View style={styles.cameraArea}>
        <CameraView 
          style={styles.cameraPlaceholder}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          {/* Overlay */}
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddleRow}>
            <View style={styles.overlaySide} />
            <View style={styles.focusFrame}>
              <View style={[styles.frameCorner, styles.topLeft]} />
              <View style={[styles.frameCorner, styles.topRight]} />
              <View style={[styles.frameCorner, styles.bottomLeft]} />
              <View style={[styles.frameCorner, styles.bottomRight]} />
              {activeTab === 'qr' && (
                <View style={styles.scanLine} />
              )}
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />

          {/* Camera Actions */}
          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="flash-outline" size={24} color="#ffffff" />
              <Text style={styles.actionText}>Flash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="image-outline" size={24} color="#ffffff" />
              <Text style={styles.actionText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      {/* Recent Scans */}
      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>Recent Scans</Text>
        <FlatList
          data={recentScans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.recentCard}>
              <Image source={{ uri: item.image }} style={styles.recentImage} />
              <View style={styles.recentContent}>
                <Text style={styles.recentStore}>{item.store}</Text>
                <Text style={styles.recentItemTitle} numberOfLines={1}>{item.title}</Text>
              </View>
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => router.push(`/offer/${item.id}`)}
              >
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          )}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  helpButton: {
    padding: 8,
    marginRight: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#111827',
  },
  cameraArea: {
    height: 350,
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#374151', // Simulating camera background
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayMiddleRow: {
    flexDirection: 'row',
    height: 200,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  focusFrame: {
    width: 200,
    height: 200,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ffffff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  cameraActions: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
  },
  recentSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 12,
    marginBottom: 12,
  },
  recentImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  recentContent: {
    flex: 1,
    marginLeft: 12,
  },
  recentStore: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
});
