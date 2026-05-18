import React from 'react';
import { View, Text, Image, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/Colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
           <Image 
             source={require('../assets/images/logo.png')} 
             style={styles.logo} 
             resizeMode="contain" 
           />
           <Text style={styles.brandName}>Offer Lanka</Text>
           <Text style={styles.tagline}>දිවයිනේ හොඳම දීමනා</Text>
        </View>

        <View style={styles.illustrationContainer}>
           <View style={styles.illustrationCard}>
              <Text style={{ fontSize: 80 }}>🛒</Text>
           </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Find the best deals near you</Text>
          <Text style={styles.subtitle}>
            Browse offers from 500+ stores across all 25 districts of Sri Lanka
          </Text>
        </View>

        <View style={styles.indicatorContainer}>
           <View style={[styles.indicator, { backgroundColor: Colors.primary, width: 24 }]} />
           <View style={styles.indicator} />
           <View style={styles.indicator} />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.replace('/register')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 16 }}>
          <Text style={styles.secondaryText}>Continue as guest</Text>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  tagline: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  illustrationContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0fdf4',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationCard: {
    width: 120,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  }
});

