import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function OTPScreen() {
  const router = useRouter();
  const { total, method, cardNumber } = useLocalSearchParams();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto focus on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter a 6-digit code');
      triggerShake();
      return;
    }
    if (fullCode !== '123456') {
      setError('Invalid OTP code. Try 123456.');
      triggerShake();
      return;
    }
    
    // Success! Route to status screen
    router.replace({
      pathname: '/payment/status',
      params: { status: 'success', total, method, cardNumber }
    });
  };

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.replace(/\D/g, '');
    setCode(newCode);
    setError('');

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }
  };

  const handleBackspace = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIdx(index - 1);
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>OTP Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.content}>
        
        {/* Floating Icon Box */}
        <View style={s.iconWrapper}>
          <MaterialCommunityIcons name="cellphone-message" size={40} color="#A78BFA" />
          <View style={s.iconBadge}>
            <Text style={s.iconBadgeText}>OTP</Text>
          </View>
        </View>
        
        <Text style={s.title}>Enter OTP</Text>
        <Text style={s.subtitle}>
          We have sent a 6 digit OTP to{'\n'}07X XXX XXXX
        </Text>

        <Animated.View style={[s.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              style={[
                s.otpBox, 
                error ? s.otpBoxError : (activeIdx === idx || digit) ? s.otpBoxActive : null
              ]}
              value={digit}
              onChangeText={t => handleChange(t, idx)}
              onKeyPress={e => handleBackspace(e, idx)}
              onFocus={() => setActiveIdx(idx)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </Animated.View>
        
        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <Text style={s.resendText}>
          {timeLeft > 0 ? `Resend OTP in 00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}` : 'Resend OTP Now'}
        </Text>

      </View>
      
      {/* Footer Branding */}
      <View style={s.footer}>
        <TouchableOpacity 
          style={s.verifyBtn}
          onPress={handleVerify}
          activeOpacity={0.8}
        >
          <Text style={s.verifyBtnText}>Verify OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0D17' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#f8fafc' },
  
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  
  iconWrapper: { 
    width: 90, height: 90, borderRadius: 45, 
    backgroundColor: '#131524', 
    alignItems: 'center', justifyContent: 'center', 
    marginBottom: 40,
    borderWidth: 1, borderColor: '#1F223B',
    shadowColor: '#7C3AED', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }
  },
  iconBadge: { position: 'absolute', bottom: -10, backgroundColor: '#2E1A5E', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#7C3AED' },
  iconBadgeText: { color: '#e2e8f0', fontSize: 11, fontWeight: '600' },
  
  title: { fontSize: 24, fontWeight: '700', color: '#f8fafc', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  otpBox: { 
    width: 48, height: 56, 
    backgroundColor: '#131524', 
    borderRadius: 8, borderWidth: 1, borderColor: '#1F223B', 
    color: '#f8fafc', fontSize: 24, fontWeight: '600', textAlign: 'center' 
  },
  otpBoxActive: { borderColor: '#7C3AED', backgroundColor: '#2E1A5E' },
  otpBoxError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 13, marginBottom: 20, fontWeight: '500' },
  
  resendText: { fontSize: 14, color: '#64748b', marginTop: 10 },
  
  footer: { paddingHorizontal: 24, paddingBottom: 40 },
  verifyBtn: { width: '100%', backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
