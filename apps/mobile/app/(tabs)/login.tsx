import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { signInWithEmail, signUpWithEmail } from '../../src/lib/auth';
import { db, auth } from '../../src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { districts } from '../../src/lib/mockData';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [district, setDistrict] = useState('Whole Country');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const handleEmailAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const userCred = await signUpWithEmail(email, password);
        // Store extra profile info in Firestore
        await setDoc(doc(db, 'users', userCred.user.uid), {
          username,
          email,
          district,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmail(email, password);
      }
      router.replace('/home');
    } catch (e) {
      console.error('Auth error', e);
      setErrorMessage(e instanceof Error ? e.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.background} pointerEvents="none" />
        <Text style={styles.title}>Welcome to OfferApp</Text>
        <GoogleSignInButton />
        <Text style={styles.or}>— OR —</Text>
            {isSignUp && (
              <>
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                />

                <View style={styles.pickerContainer}>
                  <Picker
                  selectedValue={district}
                  onValueChange={(itemValue) => setDistrict(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor="#9ca3af"
                >
                    {districts.map((d) => (
                      <Picker.Item key={d} label={d} value={d} />
                    ))}
                  </Picker>
                </View>
              </>
            )}
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {isSignUp && (
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            )}
        <TouchableOpacity style={styles.authButton} onPress={handleEmailAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.authButtonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
          )}
        </TouchableOpacity>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // dark premium background
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
    opacity: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  or: {
    color: '#9ca3af',
    marginVertical: 12,
  },
  input: {
    width: '100%',
    backgroundColor: '#1f2937',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#60a5fa',
    height: 44,
  },
  pickerItem: {
    color: '#fff',
  },
  authButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  toggleText: {
    color: '#60a5fa',
    marginTop: 16,
  },
});
