import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmail } from '../../src/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)/home');
    } catch (e) {
      console.error('Auth error', e);
      setErrorMessage(e instanceof Error ? e.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Add your Google OAuth logic here
    console.log('Continue with Google');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Ambient glow layer (decorative) */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Dummy inputs to capture aggressive browser autofill */}
          <TextInput style={{ width: 0, height: 0, padding: 0, margin: 0, opacity: 0 }} autoComplete="username" />
          <TextInput style={{ width: 0, height: 0, padding: 0, margin: 0, opacity: 0 }} secureTextEntry={true} autoComplete="current-password" />

          {/* ───────────────── LOGIN CARD ───────────────── */}
          <View style={styles.card}>

            {/* Brand Logo */}
            <View style={styles.cardHeader}>
              <View style={styles.brandLogo}>
                <Text style={styles.brandLogoText}>OL</Text>
              </View>
              <Text style={styles.cardTitle}>Welcome to OfferApp</Text>
              <Text style={styles.cardSubtitle}>
                Sign in to discover the best deals near you
              </Text>
            </View>

            {/* Google Button */}
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} activeOpacity={0.8}>
              <View style={styles.googleIconWrap}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.fieldInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
              />
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  style={[styles.fieldInput, { paddingRight: 48 }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  autoCorrect={false}
                  textContentType="newPassword"
                  importantForAutofill="no"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <View style={styles.forgotRow}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity 
              style={styles.signInBtn} 
              onPress={handleSignIn} 
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signInBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/register')}>
                <Text style={styles.signupLink}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ───────────────── BOTTOM NAV ───────────────── */}
          <View style={styles.bottomNav}>
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.navItem}
                onPress={() => {
                  setActiveNav(item.key);
                  if (item.key === 'home') router.replace('/(tabs)/home');
                  if (item.key === 'search') router.replace('/(tabs)/search');
                  if (item.key === 'browse') router.replace('/(tabs)/browse');
                  if (item.key === 'saved') router.replace('/(tabs)/saved');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.navIcon, activeNav === item.key && styles.navIconActive]}>
                  {item.icon}
                </Text>
                <Text style={[styles.navLabel, activeNav === item.key && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const NAV_ITEMS = [
  { key: 'home', icon: '🏠', label: 'Home' },
  { key: 'search', icon: '🔍', label: 'Search' },
  { key: 'browse', icon: '📖', label: 'Browse' },
  { key: 'saved', icon: '❤️', label: 'Saved' },
];

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  glowTop: { position: 'absolute', top: -120, alignSelf: 'center', width: 400, height: 280, borderRadius: 200, backgroundColor: 'rgba(168,85,247,0.06)' },
  glowBottom: { position: 'absolute', bottom: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(99,102,241,0.04)' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e9d5ff', borderRadius: 24, paddingHorizontal: 28, paddingVertical: 36, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 6 },
  cardHeader: { alignItems: 'center', marginBottom: 28 },
  brandLogo: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#7B2FF7', alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: '#7B2FF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  brandLogoText: { color: '#ffffff', fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  cardTitle: { color: '#111827', fontSize: 22, fontWeight: '700', letterSpacing: -0.3, marginBottom: 6, textAlign: 'center' },
  cardSubtitle: { color: '#6b7280', fontSize: 13.5, textAlign: 'center', lineHeight: 20 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 20 },
  googleIconWrap: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  googleIconText: { fontSize: 13, fontWeight: '700', color: '#4285F4' },
  googleBtnText: { color: '#374151', fontSize: 14, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { color: '#9ca3af', fontSize: 12, fontWeight: '500', letterSpacing: 0.5 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { color: '#6b21a8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 },
  fieldInput: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 11, paddingHorizontal: 16, paddingVertical: 12, color: '#111827', fontSize: 14, outlineStyle: 'none' as any },
  passwordWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 4 },
  eyeIcon: { fontSize: 16 },
  forgotRow: { alignItems: 'flex-end', marginTop: 2, marginBottom: 20 },
  forgotLink: { color: '#7c3aed', fontSize: 12.5, fontWeight: '500' },
  errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 12, fontSize: 13.5, fontWeight: '500' },
  signInBtn: { backgroundColor: '#7B2FF7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: '#7B2FF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
  signInBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  signupText: { color: '#4b5563', fontSize: 13.5 },
  signupLink: { color: '#a855f7', fontSize: 13.5, fontWeight: '500' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e9d5ff', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16, marginTop: 28, width: '100%', maxWidth: 420 },
  navItem: { alignItems: 'center', gap: 4, flex: 1 },
  navIcon: { fontSize: 20, opacity: 0.4 },
  navIconActive: { opacity: 1 },
  navLabel: { fontSize: 11.5, color: '#888888', fontWeight: '500' },
  navLabelActive: { color: '#7c3aed', fontWeight: '600' },
});
