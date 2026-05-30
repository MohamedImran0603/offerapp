import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/Colors';

export default function VerifyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSimulateVerify = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.replace({ pathname: '/(tabs)/home', params: { verified: 'true' } });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Email Icon */}
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 60 }}>✉️</Text>
          <View style={styles.dot} />
        </View>

        <Text style={styles.title}>Check Your Inbox!</Text>
        
        <Text style={styles.subtitle}>
          A confirmation email has been sent to your registered address. Please confirm your registration to access DealLK.
        </Text>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open My Gmail</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleSimulateVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Simulate Verification</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          disabled={timer > 0} 
          style={{ marginTop: 12 }}
        >
          <Text style={{ 
            color: timer > 0 ? '#9ca3af' : Colors.primary, 
            fontWeight: 'bold' 
          }}>
            Resend email {timer > 0 ? `(${timer}s)` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace('/register')}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Use a different email / Logout</Text>
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
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f5f3ff', // Modern clean light violet background
    borderRadius: 60,
    marginBottom: 40, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c084fc', // Vibrant accent border
  },
  dot: {
    position: 'absolute', 
    top: 25, 
    right: 25, 
    width: 16, 
    height: 16, 
    backgroundColor: Colors.primary, 
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff' // Crisp white border on a white screen
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827', // High contrast dark color
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563', // Clean readable gray
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary, 
    width: '100%', 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%', 
    paddingVertical: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: '#e9d5ff', // Elegant subtle purple border
    backgroundColor: '#ffffff', // Crisp white button
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#7c3aed', // Highly readable purple text
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 40,
  },
  logoutText: {
    color: '#6b7280', // High contrast dark gray
    fontSize: 14,
    fontWeight: '500',
  }
});

