import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentStatusScreen() {
  const router = useRouter();
  const { status, total, method, cardNumber } = useLocalSearchParams();
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isSuccess = status === 'success' || !status; // default to success if not passed for demo

  // Format date like: 25 May 2024, 09:41 PM
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{isSuccess ? 'Payment Successful' : 'Payment Failed'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.content}>
        
        <Animated.View style={[s.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={s.iconGlow}>
            {isSuccess ? (
              <Ionicons name="checkmark" size={60} color="#fff" />
            ) : (
              <Ionicons name="close" size={60} color="#fff" />
            )}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: opacityAnim, alignItems: 'center', width: '100%' }}>
          <Text style={s.title}>{isSuccess ? 'Payment Successful' : 'Payment Failed'}</Text>
          <Text style={s.message}>
            {isSuccess 
              ? 'Your payment has been completed\nsuccessfully.'
              : 'There was an issue processing your payment.\nPlease try again.'}
          </Text>

          {isSuccess && (
            <View style={s.receiptBox}>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Paid Amount</Text>
                <Text style={s.receiptValueGreen}>LKR {total || '2,700.00'}</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Transaction ID</Text>
                <Text style={s.receiptValue}>PH_{now.getFullYear()}_{now.getMonth()+1}_{Math.floor(Math.random() * 100000)}</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Date & Time</Text>
                <Text style={s.receiptValue}>{dateStr}, {timeStr}</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      <Animated.View style={[s.footer, { opacity: opacityAnim }]}>
        {isSuccess ? (
          <>
            <TouchableOpacity 
              style={s.primaryBtn} 
              activeOpacity={0.8}
            >
              <Text style={s.primaryBtnText}>View Receipt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={s.secondaryBtn} 
              onPress={() => router.replace('/home')}
              activeOpacity={0.8}
            >
              <Text style={s.secondaryBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={s.primaryBtn} 
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={s.primaryBtnText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  
  iconContainer: { marginBottom: 40 },
  iconGlow: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#10b981', // green
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 8,
    borderColor: 'rgba(16, 185, 129, 0.2)'
  },
  
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 12, textAlign: 'center' },
  message: { fontSize: 14, color: '#4b5563', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  
  receiptBox: { width: '100%', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  receiptLabel: { color: '#6b7280', fontSize: 13 },
  receiptValueGreen: { color: '#10b981', fontSize: 13, fontWeight: '600' },
  receiptValue: { color: '#1f2937', fontSize: 13, fontWeight: '500' },
  
  footer: { paddingHorizontal: 24, paddingBottom: 40 },
  primaryBtn: { backgroundColor: '#7C3AED', paddingVertical: 18, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  secondaryBtn: { paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { color: '#7c3aed', fontSize: 15, fontWeight: '600' },
});
