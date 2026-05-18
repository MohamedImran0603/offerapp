import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/Colors';
import { saveUserProfile } from '../src/lib/userService';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  
  // Phone Sign In fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [language, setLanguage] = useState('English');
  
  // Email Portal fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showModal, setShowModal] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setShowModal(false);

    if (activeTab === 'phone') {
      if (name.trim() === '' || phone.trim() === '') {
        alert('Please enter both your Name and Phone Number to sign in.');
        setLoading(false);
        return;
      }

      // Navigate immediately and save in background
      router.replace('/(tabs)/home');

      try {
        await saveUserProfile({
          name: name,
          email: '',
          phone: '+94' + phone,
          district,
          language,
        });
        console.log('✅ User profile saved to Firebase successfully');
      } catch (error) {
        console.warn('⚠️ Background save failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Email Portal Auth Login
      if (email.trim() === '' || password.trim() === '') {
        alert('Please fill in your Email Address and Password to continue.');
        setLoading(false);
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Successfully authenticated email partner portal');
        
        const uid = userCredential.user.uid;
        const adminDoc = await getDoc(doc(db, 'admins', uid));
        
        if (adminDoc.exists()) {
          console.log('👑 Admin detected! Opening secure web control panel...');
          await WebBrowser.openBrowserAsync('https://offerlanka-admin.loca.lt');
        }

        router.replace('/(tabs)/home');
      } catch (error: any) {
        console.error('❌ Portal login failed:', error);
        alert(error.message || 'Verification failed. Please review your email and password.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome back</Text>
          <Text style={styles.headerSubtitle}>Sign in to access your local retail portal</Text>
        </View>

        {/* Dynamic Selector Tabs (No Admin/User mentions!) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'phone' && styles.tabButtonActive]}
            onPress={() => setActiveTab('phone')}
          >
            <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>Quick Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'email' && styles.tabButtonActive]}
            onPress={() => setActiveTab('email')}
          >
            <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>Email Portal</Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          {activeTab === 'phone' ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.icon}>👤</Text>
                <TextInput
                  placeholder="Full Name"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.icon}>📞</Text>
                <TextInput
                  placeholder="Phone number e.g. 0771234567"
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.icon}>✉️</Text>
                <TextInput
                  placeholder="Email address"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.icon}>🔒</Text>
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </>
          )}
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={activeTab === 'phone' ? () => setShowModal(true) : handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Text style={{ color: '#6b7280' }}>or continue with</Text>
        </View>

        {/* Social Login */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={{ fontSize: 24 }}>G</Text>
            <Text style={{ marginLeft: 8, fontWeight: '500' }}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={{ fontSize: 24 }}>🍎</Text>
            <Text style={{ marginLeft: 8, fontWeight: '500' }}>Apple</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>New user? <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Create account</Text></Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Registration</Text>
            <Text style={styles.modalDesc}>We'll save your details for a faster experience.</Text>

            <View style={styles.detailsBox}>
              <Text style={styles.detailText}>Name: {name}</Text>
              <Text style={styles.detailText}>District: {district}</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.confirmText}>Save & Register</Text>}
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
    backgroundColor: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: Colors.primary,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 32,
  },
  langTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
    marginRight: 16,
  },
  langText: {
    color: '#6b7280',
    marginRight: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  detailsBox: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
  },
  cancelText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

