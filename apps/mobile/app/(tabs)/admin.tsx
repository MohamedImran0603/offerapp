import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Modal, Alert, useWindowDimensions } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, storage } from '../../src/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../src/constants/Colors';
import { useRouter } from 'expo-router';

interface Offer {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  store: string;
  imageUrl?: string;
  district: string;
  status: string;
}

interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
  targetId?: string;
}

interface SupportTicket {
  id: string;
  user: string;
  message: string;
  status: 'Open' | 'Resolved';
  timestamp: string;
}

export default function AdminScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth > 800;

  // Active view matches the sidebar layout exactly
  const [activeTab, setActiveTab] = useState<'overview' | 'offers' | 'moderation' | 'clearance' | 'support'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dashboard statistics
  const [stats, setStats] = useState({
    totalOffers: 0,
    pendingOffers: 0,
    activeStores: 12,
    systemStatus: 'Live',
  });

  // Data states
  const [offers, setOffers] = useState<Offer[]>([]);
  const [catalogOffers, setCatalogOffers] = useState<Offer[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: '1', user: 'ravindu@gmail.com', message: 'Unable to view Keells flyer in Gampaha district.', status: 'Open', timestamp: 'Just now' },
    { id: '2', user: 'imran@gmail.com', message: 'Auth confirmation not loading correctly.', status: 'Resolved', timestamp: '2 hours ago' },
    { id: '3', user: 'kisoth@gmail.com', message: 'Requesting brand partner clearance onboarding.', status: 'Open', timestamp: '1 day ago' }
  ]);

  // Onboarding Form State
  const [onboardName, setOnboardName] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardUid, setOnboardUid] = useState('');
  const [onboardRole, setOnboardRole] = useState<'moderator' | 'regional_admin' | 'super_admin'>('moderator');
  const [onboardDistrict, setOnboardDistrict] = useState('Whole Country');
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Edit Offer Modal State
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editStore, setEditStore] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editSelectedImageUri, setEditSelectedImageUri] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Add Offer Form Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addStore, setAddStore] = useState('Keells');
  const [addDistrict, setAddDistrict] = useState('Colombo');
  const [addImageUrl, setAddImageUrl] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDashboardStatsAndData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all offers to calculate total campaigns & pending moderation
      const offersSnap = await getDocs(collection(db, 'offers'));
      const allOffersList: Offer[] = [];
      let pendingCount = 0;
      
      offersSnap.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as Offer;
        allOffersList.push(item);
        if (item.status === 'pending') {
          pendingCount++;
        }
      });

      setStats({
        totalOffers: allOffersList.length,
        pendingOffers: pendingCount,
        activeStores: 12,
        systemStatus: 'Live'
      });

      setCatalogOffers(allOffersList);
      setOffers(allOffersList.filter(o => o.status === 'pending'));

      // 2. Fetch logs for activity ledger
      const logsSnap = await getDocs(collection(db, 'auditLogs'));
      const allLogsList: AuditLog[] = [];
      logsSnap.forEach((doc) => {
        allLogsList.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      allLogsList.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      setLogs(allLogsList);

    } catch (error) {
      console.error('Error fetching admin dashboard statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStatsAndData();
  }, [activeTab]);

  const handleModerate = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const offerRef = doc(db, 'offers', id);
      await updateDoc(offerRef, { status: action });
      
      // Update local states instantly
      setOffers((prev) => prev.filter((item) => item.id !== id));
      setCatalogOffers((prev) => prev.map(item => item.id === id ? { ...item, status: action } : item));
      setStats((prev) => ({ 
        ...prev, 
        pendingOffers: Math.max(0, prev.pendingOffers - 1) 
      }));
      Alert.alert('Success', `Offer successfully ${action}!`);
    } catch (error) {
      console.error('Failed to moderate offer:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const handleOpenEdit = (item: Offer) => {
    setEditingOffer(item);
    setEditTitle(item.title);
    setEditPrice(String(item.price));
    setEditOriginalPrice(String(item.originalPrice || ''));
    setEditStore(item.store);
    setEditDistrict(item.district);
    setEditSelectedImageUri(null); // Reset manual image selection
    setEditModalVisible(true);
  };

  // Image Picker Permission Launcher
  const pickImage = async (mode: 'add' | 'edit') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to upload photo flyer!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (mode === 'add') {
        setSelectedImageUri(result.assets[0].uri);
      } else {
        setEditSelectedImageUri(result.assets[0].uri);
      }
    }
  };

  // Dynamic Firebase Storage File Upload
  const uploadImageAsync = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `offers/${Date.now()}.jpg`);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleSaveEdit = async () => {
    if (!editingOffer) return;
    if (!editTitle.trim() || !editPrice.trim() || !editStore.trim()) {
      Alert.alert('Error', 'Title, Store, and Price are required.');
      return;
    }

    setEditLoading(true);
    try {
      let finalImageUrl = editingOffer.imageUrl || null;

      // Upload manually chosen new image if selected
      if (editSelectedImageUri) {
        setUploading(true);
        finalImageUrl = await uploadImageAsync(editSelectedImageUri);
        setUploading(false);
      }

      const docRef = doc(db, 'offers', editingOffer.id);
      const updatedFields = {
        title: editTitle,
        price: Number(editPrice),
        originalPrice: editOriginalPrice ? Number(editOriginalPrice) : null,
        store: editStore,
        district: editDistrict,
        imageUrl: finalImageUrl
      };

      await updateDoc(docRef, updatedFields);

      // Track inside audit logs
      await addDoc(collection(db, 'auditLogs'), {
        adminId: 'MOBILE_ROOT_ADMIN',
        adminEmail: 'admin@offerlanka.com',
        action: 'EDIT_OFFER',
        targetId: editingOffer.id,
        details: `Edited product details: "${editTitle}" by ${editStore}`,
        timestamp: new Date().toISOString()
      });

      // Update local states instantly
      setCatalogOffers((prev) =>
        prev.map((item) => (item.id === editingOffer.id ? { ...item, ...updatedFields } : item))
      );

      Alert.alert('Success', 'Product details saved successfully!');
      setEditModalVisible(false);
      setEditingOffer(null);
      setEditSelectedImageUri(null);
    } catch (error: any) {
      console.error('Editing failed:', error);
      Alert.alert('Error', 'Failed to update product details: ' + error.message);
    } finally {
      setEditLoading(false);
      setUploading(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!addTitle.trim() || !addPrice.trim()) {
      Alert.alert('Error', 'Title and Price are required.');
      return;
    }

    setAddLoading(true);
    try {
      let finalImageUrl = addImageUrl.trim() || null;

      // Upload selected manual photo if present
      if (selectedImageUri) {
        setUploading(true);
        finalImageUrl = await uploadImageAsync(selectedImageUri);
        setUploading(false);
      }

      const newOffer = {
        title: addTitle,
        price: Number(addPrice),
        store: addStore,
        district: addDistrict,
        imageUrl: finalImageUrl,
        status: 'approved',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'offers'), newOffer);

      // Track inside audit logs
      await addDoc(collection(db, 'auditLogs'), {
        adminId: 'MOBILE_ROOT_ADMIN',
        adminEmail: 'admin@offerlanka.com',
        action: 'CREATE_OFFER',
        details: `Natively added new offer: "${addTitle}" by ${addStore}`,
        timestamp: new Date().toISOString()
      });

      Alert.alert('Success', 'Successfully added new offer campaign!');
      setAddModalVisible(false);
      setAddTitle('');
      setAddPrice('');
      setAddImageUrl('');
      setSelectedImageUri(null);
      fetchDashboardStatsAndData();
    } catch (e: any) {
      Alert.alert('Error', 'Failed to create offer: ' + e.message);
    } finally {
      setAddLoading(false);
      setUploading(false);
    }
  };

  const handleDeleteOffer = (item: Offer) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to permanently delete this offer: "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '🗑️ Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'offers', item.id));

              // Log deletion event
              await addDoc(collection(db, 'auditLogs'), {
                adminId: 'MOBILE_ROOT_ADMIN',
                adminEmail: 'admin@offerlanka.com',
                action: 'DELETE_OFFER',
                targetId: item.id,
                details: `Deleted offer campaign: "${item.title}" by ${item.store}`,
                timestamp: new Date().toISOString()
              });

              // Update local state instantly
              setCatalogOffers((prev) => prev.filter((o) => o.id !== item.id));
              setStats(prev => ({ ...prev, totalOffers: Math.max(0, prev.totalOffers - 1) }));
              Alert.alert('Deleted', 'Offer has been successfully removed from catalog!');
            } catch (e: any) {
              Alert.alert('Error', 'Failed to delete: ' + e.message);
            }
          },
        },
      ]
    );
  };

  const handleOnboardSubmit = async () => {
    if (!onboardName.trim() || !onboardEmail.trim() || !onboardUid.trim()) {
      alert('Please fill in all staff details including their Auth UID.');
      return;
    }

    setOnboardLoading(true);
    try {
      const docRef = doc(db, 'admins', onboardUid);
      const permissions = onboardRole === 'super_admin'
        ? ["offers.create", "offers.edit", "offers.delete", "offers.approve", "users.manage", "analytics.view", "notifications.send"]
        : onboardRole === 'regional_admin'
        ? ["offers.create", "offers.edit", "offers.approve"]
        : ["offers.approve"];

      await setDoc(docRef, {
        name: onboardName,
        email: onboardEmail,
        role: onboardRole,
        districts: [onboardDistrict],
        permissions,
        mfaEnabled: false,
        isActive: true,
        lastLogin: "",
        createdAt: new Date().toISOString()
      });

      // Track inside global audit logs
      await addDoc(collection(db, 'auditLogs'), {
        adminId: 'MOBILE_ROOT_ADMIN',
        adminEmail: onboardEmail,
        action: 'UPDATE_ROLE',
        targetId: onboardUid,
        details: `Natively onboarded staff: "${onboardName}" as ${onboardRole}`,
        timestamp: new Date().toISOString()
      });

      Alert.alert('Success', `🎉 Staff "${onboardName}" onboarded successfully!`);
      setOnboardName('');
      setOnboardEmail('');
      setOnboardUid('');
      fetchDashboardStatsAndData();
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      Alert.alert('Error', 'Failed to provision credentials: ' + error.message);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      Alert.alert('Signed Out', 'You have been securely logged out.');
      router.replace('/register');
    } catch (err: any) {
      Alert.alert('Error', 'Sign out failed: ' + err.message);
    }
  };

  // Render Left Navigation Sidebar (desktop persistent / mobile drawer style)
  const renderSidebarContent = () => (
    <View style={styles.sidebar}>
      {/* Brand Header */}
      <View style={styles.sidebarBrandRow}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>OL</Text>
        </View>
        <View>
          <Text style={styles.brandTitleText}>Offer Lanka</Text>
          <Text style={styles.brandSubtitleText}>ENTERPRISE PANEL</Text>
        </View>
      </View>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={{ fontSize: 18, color: '#a855f7' }}>👤</Text>
        </View>
        <View>
          <Text style={styles.profileName}>Super Admin</Text>
          <View style={styles.roleBadgeContainer}>
            <Text style={styles.roleBadgeText}>SUPER ADMIN</Text>
          </View>
        </View>
      </View>

      <Text style={styles.navigationHeader}>NAVIGATION</Text>

      {/* Navigation List Links */}
      <View style={styles.navLinksList}>
        <TouchableOpacity 
          style={[styles.navLinkItem, activeTab === 'overview' && styles.navLinkActive]}
          onPress={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
        >
          <Text style={styles.navLinkIcon}>📊</Text>
          <Text style={[styles.navLinkLabel, activeTab === 'overview' && styles.navLinkActiveText]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navLinkItem, activeTab === 'offers' && styles.navLinkActive]}
          onPress={() => { setActiveTab('offers'); setIsMobileMenuOpen(false); }}
        >
          <Text style={styles.navLinkIcon}>🏷️</Text>
          <Text style={[styles.navLinkLabel, activeTab === 'offers' && styles.navLinkActiveText]}>Offer Catalogue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navLinkItem, activeTab === 'moderation' && styles.navLinkActive]}
          onPress={() => { setActiveTab('moderation'); setIsMobileMenuOpen(false); }}
        >
          <Text style={styles.navLinkIcon}>🗣️</Text>
          <Text style={[styles.navLinkLabel, activeTab === 'moderation' && styles.navLinkActiveText]}>Moderation Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navLinkItem, activeTab === 'clearance' && styles.navLinkActive]}
          onPress={() => { setActiveTab('clearance'); setIsMobileMenuOpen(false); }}
        >
          <Text style={styles.navLinkIcon}>⚙️</Text>
          <Text style={[styles.navLinkLabel, activeTab === 'clearance' && styles.navLinkActiveText]}>System Clearance</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navLinkItem, activeTab === 'support' && styles.navLinkActive]}
          onPress={() => { setActiveTab('support'); setIsMobileMenuOpen(false); }}
        >
          <Text style={styles.navLinkIcon}>💬</Text>
          <Text style={[styles.navLinkLabel, activeTab === 'support' && styles.navLinkActiveText]}>Support Desk</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🚪</Text>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.layoutBody}>
        {/* LEFT SIDEBAR (Only visible on wide screen layouts) */}
        {isDesktop && renderSidebarContent()}

        {/* RIGHT CONTENT DISPLAY WINDOW */}
        <View style={styles.mainContentView}>
          {/* Mobile Header Bar */}
          {!isDesktop && (
            <View style={styles.mobileHeaderBar}>
              <TouchableOpacity onPress={() => setIsMobileMenuOpen(true)} style={styles.menuIconContainer}>
                <Text style={{ fontSize: 24, color: '#ffffff' }}>☰</Text>
              </TouchableOpacity>
              <Text style={styles.mobileHeaderTitle}>Offer Lanka Enterprise</Text>
              <TouchableOpacity onPress={fetchDashboardStatsAndData} style={styles.mobileRefreshContainer}>
                <Text style={{ fontSize: 18 }}>🔄</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* DYNAMIC VIEWS INTEGRATION */}
          {activeTab === 'overview' && (
            loading ? (
              <View style={styles.centerSpinner}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={{ color: '#a1a1aa', marginTop: 12 }}>Loading analytics...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentScrollPadding}>
                <Text style={styles.sectionHeaderTitle}>Dashboard Overview</Text>

                {/* Grid of three high-fidelity white cards */}
                <View style={styles.dashboardStatsRow}>
                  <View style={styles.dashboardStatCard}>
                    <Text style={styles.cardLabelTitle}>Total Offers</Text>
                    <Text style={styles.cardStatValue}>{stats.totalOffers}</Text>
                  </View>
                  <View style={styles.dashboardStatCard}>
                    <Text style={styles.cardLabelTitle}>Active Stores</Text>
                    <Text style={styles.cardStatValue}>{stats.activeStores}</Text>
                  </View>
                  <View style={styles.dashboardStatCard}>
                    <Text style={styles.cardLabelTitle}>System Status</Text>
                    <Text style={[styles.cardStatValue, { color: '#22c55e' }]}>{stats.systemStatus}</Text>
                  </View>
                </View>

                {/* Recent System Activity Box */}
                <View style={styles.activityCardBox}>
                  <Text style={styles.activityBoxHeaderTitle}>Recent System Activity</Text>
                  <View style={styles.activityItemsGroup}>
                    <View style={styles.activityItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityItemTitleText}>Database Connection Established</Text>
                        <Text style={styles.activityItemTimeText}>Just now</Text>
                      </View>
                      <View style={styles.activitySuccessBadge}>
                        <Text style={styles.successBadgeText}>Success</Text>
                      </View>
                    </View>
                    {logs.slice(0, 4).map((log) => (
                      <View key={log.id} style={styles.activityItemRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activityItemTitleText}>{log.details}</Text>
                          <Text style={styles.activityItemTimeText}>{log.adminEmail} · logged</Text>
                        </View>
                        <View style={[styles.activitySuccessBadge, { backgroundColor: '#f3e8ff' }]}>
                          <Text style={[styles.successBadgeText, { color: '#7e22ce' }]}>{log.action.replace('_', ' ')}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )
          )}

          {activeTab === 'offers' && (
            loading ? (
              <View style={styles.centerSpinner}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={{ color: '#a1a1aa', marginTop: 12 }}>Loading offer catalogue...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentScrollPadding}>
                <View style={styles.offersHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>Manage Offers</Text>
                  <TouchableOpacity onPress={() => { setSelectedImageUri(null); setAddModalVisible(true); }} style={styles.addNewOfferBtn}>
                    <Text style={styles.addNewOfferBtnText}>+ Add New Offer</Text>
                  </TouchableOpacity>
                </View>

                {/* Offer Catalogue Table-like Card Layout */}
                <View style={styles.catalogueTableCard}>
                  {catalogOffers.map((offer) => (
                    <View key={offer.id} style={styles.catalogueItemRow}>
                      <View style={styles.catalogueLeftSection}>
                        {offer.imageUrl ? (
                          <Image source={{ uri: offer.imageUrl }} style={styles.catalogOfferImg} />
                        ) : (
                          <View style={styles.catalogOfferImgPlaceholder}>
                            <Text style={{ fontSize: 10, color: '#6b7280' }}>No Img</Text>
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={styles.catalogOfferTitle}>{offer.title}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                            <View style={styles.catalogStoreBadge}>
                              <Text style={styles.catalogStoreText}>{offer.store}</Text>
                            </View>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>📍 {offer.district}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.catalogueRightSection}>
                        <Text style={styles.catalogPriceValue}>Rs. {offer.price}</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <TouchableOpacity onPress={() => handleOpenEdit(offer)} style={styles.catalogEditActionBtn}>
                            <Text style={styles.catalogEditText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteOffer(offer)} style={styles.catalogDeleteActionBtn}>
                            <Text style={styles.catalogDeleteText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                  {catalogOffers.length === 0 && (
                    <Text style={styles.emptyText}>No offer campaigns in system catalog.</Text>
                  )}
                </View>
              </ScrollView>
            )
          )}

          {activeTab === 'moderation' && (
            loading ? (
              <View style={styles.centerSpinner}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={{ color: '#a1a1aa', marginTop: 12 }}>Loading moderation queue...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentScrollPadding}>
                <Text style={styles.sectionHeaderTitle}>Moderation Queue</Text>
                <Text style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 20 }}>Approve or reject submitted grocery flyers and product flyers below.</Text>

                <View style={styles.catalogueTableCard}>
                  {offers.map((offer) => (
                    <View key={offer.id} style={styles.catalogueItemRow}>
                      <View style={styles.catalogueLeftSection}>
                        {offer.imageUrl ? (
                          <Image source={{ uri: offer.imageUrl }} style={styles.catalogOfferImg} />
                        ) : (
                          <View style={styles.catalogOfferImgPlaceholder}>
                            <Text style={{ fontSize: 10, color: '#6b7280' }}>No Img</Text>
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={styles.catalogOfferTitle}>{offer.title}</Text>
                          <View style={styles.catalogStoreBadge}>
                            <Text style={styles.catalogStoreText}>{offer.store}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.catalogueRightSection}>
                        <Text style={styles.catalogPriceValue}>Rs. {offer.price}</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <TouchableOpacity onPress={() => handleModerate(offer.id, 'rejected')} style={styles.moderationRejectBtn}>
                            <Text style={styles.moderationRejectText}>Reject</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleModerate(offer.id, 'approved')} style={styles.moderationApproveBtn}>
                            <Text style={styles.moderationApproveText}>Approve</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                  {offers.length === 0 && (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                      <Text style={{ fontSize: 40, marginBottom: 12 }}>🎉</Text>
                      <Text style={{ color: '#6b7280', fontSize: 14 }}>All clear! No pending campaigns in moderation queue.</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )
          )}

          {activeTab === 'clearance' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentScrollPadding}>
              <Text style={styles.sectionHeaderTitle}>System Clearance & Settings</Text>
              
              <View style={styles.clearanceContainerLayout}>
                {/* Onboard new staff */}
                <View style={styles.clearanceOnboardCard}>
                  <Text style={styles.clearanceBoxTitle}>Onboard Administrative Staff</Text>
                  <Text style={styles.clearanceBoxDesc}>Provision credentials and authorization scopes for moderators natively.</Text>

                  <View style={styles.formInputGroup}>
                    <Text style={styles.formInputLabel}>Staff Name</Text>
                    <TextInput 
                      style={styles.formTextInputField}
                      placeholder="e.g. Ravindu Perera"
                      placeholderTextColor="#a1a1aa"
                      value={onboardName}
                      onChangeText={setOnboardName}
                    />
                  </View>

                  <View style={styles.formInputGroup}>
                    <Text style={styles.formInputLabel}>Staff Email</Text>
                    <TextInput 
                      style={styles.formTextInputField}
                      placeholder="admin@offerlanka.com"
                      placeholderTextColor="#a1a1aa"
                      value={onboardEmail}
                      onChangeText={setOnboardEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.formInputGroup}>
                    <Text style={styles.formInputLabel}>User Auth UID (Firebase)</Text>
                    <TextInput 
                      style={[styles.formTextInputField, { fontFamily: 'monospace' }]}
                      placeholder="e.g. bG12H4J8z7dY9..."
                      placeholderTextColor="#a1a1aa"
                      value={onboardUid}
                      onChangeText={setOnboardUid}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.formInputGroup}>
                    <Text style={styles.formInputLabel}>Role Scope</Text>
                    <View style={styles.formPickerRow}>
                      {(['moderator', 'regional_admin', 'super_admin'] as const).map((role) => (
                        <TouchableOpacity
                          key={role}
                          style={[styles.formPickerBtn, onboardRole === role && styles.formPickerActive]}
                          onPress={() => setOnboardRole(role)}
                        >
                          <Text style={[styles.formPickerText, onboardRole === role && styles.formPickerTextActive]}>
                            {role === 'moderator' ? '🛡️ Mod' : role === 'regional_admin' ? '📍 Regional' : '⚡ Super'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity style={styles.formSubmitBtn} onPress={handleOnboardSubmit} disabled={onboardLoading}>
                    {onboardLoading ? <ActivityIndicator color="white" /> : <Text style={styles.formSubmitText}>Complete Provisioning</Text>}
                  </TouchableOpacity>
                </View>

                {/* Audit Ledger */}
                <View style={styles.clearanceOnboardCard}>
                  <Text style={styles.clearanceBoxTitle}>Unalterable Audit Trail Log</Text>
                  <Text style={styles.clearanceBoxDesc}>Read-only global ledger recording administrative activity across all roles.</Text>

                  <ScrollView style={{ maxHeight: 400 }}>
                    {logs.map((log) => (
                      <View key={log.id} style={styles.clearanceLogItem}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={styles.logLabelBox}>
                            <Text style={styles.logLabelText}>{log.action.replace('_', ' ')}</Text>
                          </View>
                          <Text style={{ fontSize: 11, color: '#71717a' }}>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
                        </View>
                        <Text style={styles.logDetailsText}>{log.details}</Text>
                        <Text style={styles.logAuthorText}>By {log.adminEmail}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </ScrollView>
          )}

          {activeTab === 'support' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentScrollPadding}>
              <Text style={styles.sectionHeaderTitle}>Support Desk</Text>
              <Text style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 20 }}>Manage consumer help tickets, brand inquiries, and system bug reports.</Text>

              <View style={styles.catalogueTableCard}>
                {tickets.map((ticket) => (
                  <View key={ticket.id} style={styles.catalogueItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827' }}>From: {ticket.user}</Text>
                      <Text style={{ fontSize: 13, color: '#4b5563', marginTop: 6, lineHeight: 18 }}>{ticket.message}</Text>
                      <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Submitted: {ticket.timestamp}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                      <View style={[styles.activitySuccessBadge, { backgroundColor: ticket.status === 'Resolved' ? '#d1fae5' : '#fee2e2' }]}>
                        <Text style={[styles.successBadgeText, { color: ticket.status === 'Resolved' ? '#065f46' : '#991b1b' }]}>{ticket.status}</Text>
                      </View>
                      {ticket.status === 'Open' && (
                        <TouchableOpacity 
                          style={styles.catalogEditActionBtn}
                          onPress={() => {
                            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'Resolved' } : t));
                            Alert.alert('Resolved', 'Support ticket marked as resolved!');
                          }}
                        >
                          <Text style={styles.catalogEditText}>Resolve</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

        </View>
      </View>

      {/* MOBILE HEADER SIDEBAR SLIDING OVERLAY */}
      {isMobileMenuOpen && (
        <Modal visible={isMobileMenuOpen} transparent animationType="fade">
          <View style={styles.mobileModalOverlay}>
            <View style={styles.mobileModalSidebarContainer}>
              {renderSidebarContent()}
              <TouchableOpacity onPress={() => setIsMobileMenuOpen(false)} style={styles.closeMobileMenuBtn}>
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>Close Menu ✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* NATIVE PRODUCT DETAIL EDIT MODAL FORM                         */}
      {/* ============================================================ */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 Edit Product Details</Text>
            <Text style={styles.modalDesc}>Modify pricing, store campaigns, and district settings in real-time.</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Product Title</Text>
                <TextInput 
                  style={styles.formTextInputField}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />
              </View>

              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Store Partner</Text>
                <TextInput 
                  style={styles.formTextInputField}
                  value={editStore}
                  onChangeText={setEditStore}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formInputGroup, { flex: 1 }]}>
                  <Text style={styles.formInputLabel}>Price (LKR)</Text>
                  <TextInput 
                    style={styles.formTextInputField}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formInputGroup, { flex: 1 }]}>
                  <Text style={styles.formInputLabel}>Original Price (LKR)</Text>
                  <TextInput 
                    style={styles.formTextInputField}
                    value={editOriginalPrice}
                    onChangeText={setEditOriginalPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Target District</Text>
                <TextInput 
                  style={styles.formTextInputField}
                  value={editDistrict}
                  onChangeText={setEditDistrict}
                />
              </View>

              {/* Dynamic Photo Selection for Editing */}
              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Product Flyer Photo</Text>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 6 }}>
                  <TouchableOpacity onPress={() => pickImage('edit')} style={styles.addNewOfferBtn}>
                    <Text style={styles.addNewOfferBtnText}>📸 Select Photo</Text>
                  </TouchableOpacity>
                  {editSelectedImageUri && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Image source={{ uri: editSelectedImageUri }} style={{ width: 40, height: 40, borderRadius: 6 }} />
                      <TouchableOpacity onPress={() => setEditSelectedImageUri(null)}>
                        <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {uploading && <ActivityIndicator color="#a855f7" style={{ marginTop: 8 }} />}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelButton} disabled={editLoading || uploading}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleSaveEdit}
                disabled={editLoading || uploading}
              >
                {editLoading ? <ActivityIndicator color="white" /> : <Text style={styles.confirmText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* NATIVE PRODUCT ADD OFFER MODAL FORM                         */}
      {/* ============================================================ */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✨ Add New Offer Campaign</Text>
            <Text style={styles.modalDesc}>Publish new grocery flyers instantly inside the consumer mobile app feed.</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Product Title</Text>
                <TextInput 
                  style={styles.formTextInputField}
                  placeholder="e.g. Fresh organic banana Cavendish"
                  placeholderTextColor="#a1a1aa"
                  value={addTitle}
                  onChangeText={setAddTitle}
                />
              </View>

              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Price (LKR)</Text>
                <TextInput 
                  style={styles.formTextInputField}
                  placeholder="e.g. 240"
                  placeholderTextColor="#a1a1aa"
                  value={addPrice}
                  onChangeText={setAddPrice}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Store Partner</Text>
                <TextInput 
                  style={styles.formTextInputField}
                  placeholder="e.g. Keells"
                  placeholderTextColor="#a1a1aa"
                  value={addStore}
                  onChangeText={setAddStore}
                />
              </View>

              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Target District</Text>
                <TextInput 
                  style={styles.formTextInputField}
                  placeholder="e.g. Colombo"
                  placeholderTextColor="#a1a1aa"
                  value={addDistrict}
                  onChangeText={setAddDistrict}
                />
              </View>

              {/* OPTION A: Image URL Option */}
              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Option A: Product Image URL</Text>
                <TextInput 
                  style={styles.formTextInputField}
                  placeholder="e.g. https://images.unsplash.com/..."
                  placeholderTextColor="#a1a1aa"
                  value={addImageUrl}
                  onChangeText={setAddImageUrl}
                  editable={!selectedImageUri} // Lock URL input if manual photo is picked
                />
              </View>

              {/* OPTION B: Manual Gallery Picker Selection */}
              <View style={styles.formInputGroup}>
                <Text style={styles.formInputLabel}>Option B: Choose Photo from Device Gallery</Text>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 }}>
                  <TouchableOpacity 
                    onPress={() => pickImage('add')} 
                    style={[styles.addNewOfferBtn, { backgroundColor: '#18181b' }]}
                    disabled={!!addImageUrl} // Lock picker if URL is pasted
                  >
                    <Text style={styles.addNewOfferBtnText}>📸 Select Photo</Text>
                  </TouchableOpacity>
                  {selectedImageUri && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Image source={{ uri: selectedImageUri }} style={{ width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#e4e4e7' }} />
                      <TouchableOpacity onPress={() => setSelectedImageUri(null)}>
                        <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16 }}>✕ Remove</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {uploading && (
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <ActivityIndicator color="#a855f7" size="small" />
                    <Text style={{ color: '#71717a', fontSize: 12 }}>Uploading photo to Firebase Storage...</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.cancelButton} disabled={addLoading || uploading}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCreateOffer}
                disabled={addLoading || uploading}
              >
                {addLoading ? <ActivityIndicator color="white" /> : <Text style={styles.confirmText}>Add Campaign</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214', // Exact luxury dark background matching Screenshot 1!
  },
  layoutBody: {
    flex: 1,
    flexDirection: 'row',
  },
  // SIDEBAR ARCHITECTURE (Exact replica of Next.js Enterprise left navigation menu)
  sidebar: {
    width: 260,
    backgroundColor: '#09090b', // Near black background matching left sidebar
    borderRightWidth: 1,
    borderRightColor: '#1f1f23',
    padding: 24,
    paddingTop: 54, // Perfect gap below modern phone notch/status bar clocks!
    justifyContent: 'flex-start',
  },
  sidebarBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  brandBadge: {
    backgroundColor: '#a855f7',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  brandTitleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandSubtitleText: {
    color: '#c084fc',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  profileAvatar: {
    backgroundColor: '#27272a',
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  roleBadgeContainer: {
    backgroundColor: '#182218',
    borderColor: '#14532d',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    color: '#4ade80',
    fontSize: 8,
    fontWeight: 'bold',
  },
  navigationHeader: {
    color: '#52525b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  navLinksList: {
    gap: 12, // Comfortably spaced
    marginVertical: 12,
  },
  navLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navLinkActive: {
    backgroundColor: '#3b0764', // Deep purple hover highlight
    borderColor: '#7e22ce',
    borderWidth: 1,
  },
  navLinkIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  navLinkLabel: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
  },
  navLinkActiveText: {
    color: '#ffffff',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  signOutText: {
    color: '#f87171',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // RIGHT CONTENT AREA WINDOW STYLE
  mainContentView: {
    flex: 1,
    backgroundColor: '#121214',
  },
  mobileHeaderBar: {
    paddingTop: 36, // Drop perfectly below the phone clock and status metrics!
    paddingBottom: 16,
    backgroundColor: '#09090b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f23',
  },
  menuIconContainer: {
    padding: 8,
  },
  mobileHeaderTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mobileRefreshContainer: {
    padding: 8,
  },
  contentScrollPadding: {
    padding: 32,
    paddingBottom: 60,
  },
  sectionHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  // DASHBOARD LAYOUT & CARDS (Exact match to Screenshot 1!)
  dashboardStatsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  dashboardStatCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#ffffff', // High-fidelity pure white cards!
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLabelTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardStatValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#09090b',
    marginTop: 12,
  },
  activityCardBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  activityBoxHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 20,
  },
  activityItemsGroup: {
    gap: 16,
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  activityItemTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#09090b',
  },
  activityItemTimeText: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 4,
  },
  activitySuccessBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  successBadgeText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // CATALOGUE / MANAGE OFFERS TABLE (Exact replica of Screenshot 2!)
  offersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  addNewOfferBtn: {
    backgroundColor: '#09090b', // Slate black Add button
    borderColor: '#27272a',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addNewOfferBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  catalogueTableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  catalogueItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    flexWrap: 'wrap',
    gap: 16,
  },
  catalogueLeftSection: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catalogOfferImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
  },
  catalogOfferImgPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogOfferTitle: {
    color: '#09090b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  catalogStoreBadge: {
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  catalogStoreText: {
    color: '#18181b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  catalogueRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    flexWrap: 'wrap',
  },
  catalogPriceValue: {
    color: '#09090b',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 80,
  },
  catalogEditActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3e8ff',
  },
  catalogEditText: {
    color: '#7e22ce',
    fontSize: 13,
    fontWeight: 'bold',
  },
  catalogDeleteActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  catalogDeleteText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  moderationApproveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
  },
  moderationApproveText: {
    color: '#065f46',
    fontSize: 13,
    fontWeight: 'bold',
  },
  moderationRejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  moderationRejectText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // SYSTEM CLEARANCE CARD
  clearanceContainerLayout: {
    gap: 24,
  },
  clearanceOnboardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  clearanceBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 6,
  },
  clearanceBoxDesc: {
    fontSize: 13,
    color: '#71717a',
    marginBottom: 20,
  },
  clearanceLogItem: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  logLabelBox: {
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  logLabelText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#18181b',
  },
  logDetailsText: {
    fontSize: 13,
    color: '#27272a',
    marginTop: 8,
    lineHeight: 18,
  },
  logAuthorText: {
    fontSize: 11,
    color: '#71717a',
    fontStyle: 'italic',
    marginTop: 6,
  },
  // MOBILE MENU Drawer OVERLAY
  mobileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
  },
  mobileModalSidebarContainer: {
    width: 280,
    backgroundColor: '#09090b',
  },
  closeMobileMenuBtn: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#27272a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  // TEXT FORM FIELDS & PICKERS
  formInputGroup: {
    marginBottom: 16,
  },
  formInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  formTextInputField: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#09090b',
  },
  formPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formPickerBtn: {
    flex: 1,
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formPickerActive: {
    backgroundColor: '#a855f7',
  },
  formPickerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
  },
  formPickerTextActive: {
    color: '#ffffff',
  },
  formSubmitBtn: {
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  formSubmitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centerSpinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    padding: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: '#71717a',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelText: {
    color: '#71717a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
