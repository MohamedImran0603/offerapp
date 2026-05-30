import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS as Colors } from '../src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Checkbox } from 'expo-checkbox';

const districts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle"
];

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegister = async () => {
    if ((contactMethod === 'email' && !email.trim()) || (contactMethod === 'phone' && !phone.trim()) || !name.trim() || !password.trim() || !confirmPassword.trim() || !district) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    // Validate phone number length when phone method selected
    if (contactMethod === 'phone' && !/^\d{10}$/.test(phone)) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Error', 'You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid,
        name: name.trim(),
        email: contactMethod === 'email' ? email.toLowerCase().trim() : '',
        phone: contactMethod === 'phone' ? phone.trim() : '',
        district,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      setRegistrationSuccess(true);
      setTimeout(() => {
        setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setDistrict(''); setAgreedToTerms(false); 
        auth.signOut().then(() => {
          router.replace('/(tabs)/login');
        });
      }, 2000);
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
          <LinearGradient colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]} style={styles.header}>
            <Text style={styles.headerText}>OfferApp</Text>
          </LinearGradient>
          <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>OL</Text>
            </View>
          </View>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join OfferApp — discover deals across Sri Lanka</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar} />
          </View>

          <Text style={styles.sectionTitle}>PERSONAL INFO</Text>

          <Text style={styles.fieldLabel}>FULL NAME</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder=""
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <Text style={styles.fieldLabel}>CONTACT</Text>
          <View style={styles.contactTabs}>
            <TouchableOpacity style={[styles.tab, contactMethod === 'email' ? styles.activeTab : null]} onPress={() => setContactMethod('email')}>
              <Text style={contactMethod === 'email' ? styles.activeTabText : styles.inactiveTabText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, contactMethod === 'phone' ? styles.activeTab : null]} onPress={() => setContactMethod('phone')}>
              <Text style={contactMethod === 'phone' ? styles.activeTabText : styles.inactiveTabText}>Phone</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>{contactMethod === 'email' ? 'EMAIL ADDRESS' : 'PHONE NUMBER'}</Text>
          <View style={styles.inputContainer}>
            {contactMethod === 'email' && (
              <TextInput
                placeholder=""
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
                autoComplete="off"
                textContentType="none"
              />
            )}
            {contactMethod === 'phone' && (
              <TextInput
                placeholder="e.g. 0712345678"
                style={styles.input}
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
                maxLength={10}
              />
            )}
          </View>

          <Text style={styles.sectionTitle}>SECURITY</Text>

          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Min 8 characters"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9ca3af"
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Repeat password"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#9ca3af"
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>DISTRICT</Text>
          <Text style={styles.fieldLabel}>YOUR DISTRICT</Text>
          <View style={styles.inputContainer}>
            <Picker
              selectedValue={district}
              onValueChange={setDistrict}
              style={styles.picker}
              dropdownIconColor={Colors.primaryLight}
            >
              <Picker.Item label="Select your district" value="" color="#aaaaaa" />
              {districts.map((dist) => (
                <Picker.Item key={dist} label={dist} value={dist} color="#ffffff" />
              ))}
            </Picker>
          </View>

          <View style={styles.termsContainer}>
            <Checkbox
              value={agreedToTerms}
              onValueChange={setAgreedToTerms}
              color={agreedToTerms ? Colors.primary : undefined}
            />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.linkHighlight}>Terms of Service</Text> and{' '}
              <Text style={styles.linkHighlight}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity style={registrationSuccess ? styles.buttonSuccess : styles.button} onPress={handleRegister} disabled={loading || registrationSuccess}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name={registrationSuccess ? "checkmark-circle" : "person-add"} size={20} color="white" />
                <Text style={styles.buttonText}>{registrationSuccess ? 'Account Created' : 'Create Account'}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => router.replace('/(tabs)/login')}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#ffffff', borderRadius: 28, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 6 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 56, height: 56, borderRadius: 999, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#4b5563', textAlign: 'center', marginBottom: 20 },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  progressBar: { width: 80, height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  sectionTitle: { color: Colors.primary, fontSize: 13, fontWeight: '700', marginTop: 20, marginBottom: 8, letterSpacing: 0.5 },
  fieldLabel: { color: '#374151', fontSize: 13, marginBottom: 6, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  input: { flex: 1, color: '#111827', fontSize: 16 },
  contactTabs: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: Colors.primary },
  activeTabText: { color: 'white', fontWeight: '600' },
  inactiveTabText: { color: '#6b7280' },
  picker: { flex: 1, color: '#111827', backgroundColor: 'transparent' },
  termsContainer: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 16 },
  termsText: { flex: 1, color: '#374151', fontSize: 14, marginLeft: 10, lineHeight: 20 },
  linkHighlight: { color: Colors.primary },
  button: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonSuccess: { backgroundColor: Colors.success, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#374151', fontSize: 15, fontWeight: '500' },
  header: { backgroundColor: '#ffffff', padding: 16, paddingTop: 40, alignItems: 'center', height: 80, justifyContent: 'center' },
  headerText: { color: '#7B2FF7', fontSize: 20, fontWeight: 'bold' },
});