import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Foundation } from '@expo/vector-icons';
import { useCart } from '../src/lib/CartContext';
import { validateCardNumber, validateCVV, validateExpiry, validateWallet } from '../src/lib/paymentValidation';

const { width } = Dimensions.get('window');

const WALLETS = [
  { id: 'mcash', name: 'mCash', sub: 'Pay using mCash Wallet', icon: 'cellphone-nfc', color: '#0ea5e9' },
  { id: 'ezcash', name: 'eZ Cash', sub: 'Pay using eZ Cash Wallet', icon: 'wallet', color: '#eab308' },
  { id: 'frimi', name: 'Frimi', sub: 'Pay using Frimi Wallet', icon: 'alpha-f-circle', color: '#ec4899' },
  { id: 'genie', name: 'Genie', sub: 'Pay using Genie Wallet', icon: 'magic-staff', color: '#10b981' },
];

const BANKS = [
  { id: 'combank', name: 'Commercial Bank', icon: 'bank', color: '#3b82f6' },
  { id: 'sampath', name: 'Sampath Bank', icon: 'bank-outline', color: '#f97316' },
  { id: 'hnb', name: 'HNB', icon: 'bank', color: '#eab308' },
  { id: 'boc', name: 'BOC', icon: 'bank-circle-outline', color: '#eab308' },
  { id: 'peoples', name: "People's Bank", icon: 'bank', color: '#eab308' },
];

const EXPIRY_OPTIONS = Array.from({length: 120}, (_, i) => {
  const m = (i % 12) + 1;
  const y = 24 + Math.floor(i / 12);
  return `${m < 10 ? '0'+m : m}/${y}`;
});

export default function PaymentGatewayScreen() {
  const router = useRouter();
  const { total: cartTotal, items } = useCart();

  const [activeTab, setActiveTab] = useState<'card' | 'wallet' | 'bank' | 'qr'>('card');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  // Wallet Form State
  const [walletPhone, setWalletPhone] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Summary Logic
  const subtotal = cartTotal;
  const discount = subtotal > 0 ? 350 : 0;
  const deliveryFee = subtotal > 0 ? 200 : 0;
  const finalTotal = subtotal > 0 ? subtotal - discount + deliveryFee : 0;

  const handlePay = () => {
    setErrors({});
    let hasError = false;
    let currentErrors: Record<string, string> = {};

    if (activeTab === 'card') {
      if (!cardName.trim()) {
        currentErrors.name = 'Card holder name is required';
        hasError = true;
      }
      const cardVal = validateCardNumber(cardNumber);
      if (!cardVal.isValid) {
        currentErrors.cardNumber = cardVal.error || 'Invalid card';
        hasError = true;
      }
      const expiryVal = validateExpiry(expiry);
      if (!expiryVal.isValid) {
        currentErrors.expiry = expiryVal.error || 'Invalid expiry';
        hasError = true;
      }
      const cvvVal = validateCVV(cvc, cardVal.network || 'unknown');
      if (!cvvVal.isValid) {
        currentErrors.cvv = cvvVal.error || 'Invalid CVV';
        hasError = true;
      }
      if (hasError) {
        setErrors(currentErrors);
        return;
      }
      router.push({
        pathname: '/payment/otp',
        params: { total: finalTotal, method: 'card', cardNumber: cardNumber.slice(-4) }
      });
    } else if (activeTab === 'wallet') {
      if (!selectedWallet) return;
      if (['mcash', 'ezcash'].includes(selectedWallet)) {
        if (!walletPhone.trim()) {
          currentErrors.walletPhone = 'Mobile number is required';
          hasError = true;
        } else {
          const walletVal = validateWallet(selectedWallet, walletPhone, finalTotal, walletPin);
          if (!walletVal.isValid) {
            if (walletVal.error?.includes('PIN')) {
              currentErrors.walletPin = walletVal.error || '';
            } else {
              currentErrors.walletPhone = walletVal.error || '';
            }
            hasError = true;
          }
        }
      }
      if (hasError) {
        setErrors(currentErrors);
        return;
      }
      router.push({
        pathname: '/payment/otp',
        params: { total: finalTotal, method: selectedWallet }
      });
    }
  };

  const renderTab = (id: typeof activeTab, label: string, icon: string, lib: string) => {
    const isActive = activeTab === id;
    return (
      <TouchableOpacity 
        style={[s.tab, isActive && s.tabActive]} 
        onPress={() => setActiveTab(id)}
        activeOpacity={0.8}
      >
        <View style={[s.tabIconBox, isActive && s.tabIconBoxActive]}>
          {lib === 'FontAwesome5' ? (
            <FontAwesome5 name={icon} size={20} color={isActive ? '#fff' : '#9ca3af'} />
          ) : lib === 'Foundation' ? (
            <Foundation name={icon as any} size={24} color={isActive ? '#fff' : '#9ca3af'} />
          ) : lib === 'MaterialCommunityIcons' ? (
            <MaterialCommunityIcons name={icon as any} size={22} color={isActive ? '#fff' : '#9ca3af'} />
          ) : (
            <Ionicons name={icon as any} size={22} color={isActive ? '#fff' : '#9ca3af'} />
          )}
        </View>
        <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.root}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        
        {/* ORDER SUMMARY */}
        <View style={s.summaryCard}>
          <Text style={s.sectionTitle}>Order Summary</Text>
          
          {items.length === 0 ? (
            <View style={s.itemRow}>
              <Text style={{ color: '#94a3b8' }}>Your cart is empty.</Text>
            </View>
          ) : (
            items.map(item => (
              <View key={item.id} style={s.itemRow}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={s.itemImage} />
                ) : (
                  <View style={s.itemIconWrap}>
                    <Ionicons name="cart" size={24} color="#A78BFA" />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.itemName}>{item.title}</Text>
                  <Text style={s.itemSub}>Qty: {item.quantity}</Text>
                </View>
                <Text style={s.itemPrice}>LKR {(item.price * item.quantity).toLocaleString()}.00</Text>
              </View>
            ))
          )}
          
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Discount</Text>
            <Text style={s.discountValue}>- LKR {discount.toLocaleString()}.00</Text>
          </View>
          
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Delivery Fee</Text>
            <Text style={s.summaryValue}>LKR {deliveryFee.toLocaleString()}.00</Text>
          </View>
          
          <View style={s.divider} />
          
          <View style={s.summaryRow}>
            <Text style={s.totalLabel}>Total Amount</Text>
            <Text style={s.totalValue}>LKR {finalTotal.toLocaleString()}.00</Text>
          </View>
        </View>

        {/* PAYMENT METHOD TABS */}
        <Text style={s.sectionTitle}>Select Payment Method</Text>
        <Text style={s.sectionSub}>Choose your preferred payment option</Text>
        
        <View style={s.tabsRow}>
          {renderTab('card', 'Card', 'credit-card', 'FontAwesome5')}
          {renderTab('wallet', 'Wallet', 'wallet', 'Ionicons')}
          {renderTab('bank', 'Bank', 'bank', 'MaterialCommunityIcons')}
          {renderTab('qr', 'QR', 'qrcode', 'FontAwesome5')}
        </View>

        {/* TAB CONTENT: CARD */}
        {activeTab === 'card' && (
          <View style={s.formContainer}>
            <View style={s.inputGroup}>
              <Text style={s.label}>Card Number</Text>
              <View style={[s.inputWrap, errors.cardNumber ? s.inputError : null]}>
                <TextInput
                  style={s.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#475569"
                  value={cardNumber}
                  onChangeText={t => {
                    setCardNumber(t.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim());
                  }}
                  keyboardType="number-pad"
                  maxLength={19}
                />
                <Ionicons name="camera-outline" size={24} color="#94a3b8" />
              </View>
              {errors.cardNumber && <Text style={s.errorText}>{errors.cardNumber}</Text>}
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Card Holder Name</Text>
              <View style={[s.inputWrap, errors.name ? s.inputError : null]}>
                <TextInput
                  style={s.input}
                  placeholder="Mohamed Imran"
                  placeholderTextColor="#475569"
                  value={cardName}
                  onChangeText={setCardName}
                />
              </View>
              {errors.name && <Text style={s.errorText}>{errors.name}</Text>}
            </View>

            <View style={s.row}>
              <View style={[s.inputGroup, { flex: 1, marginRight: 16 }]}>
                <Text style={s.label}>Expiry Date</Text>
                <TouchableOpacity 
                  style={[s.inputWrap, errors.expiry ? s.inputError : null, { paddingVertical: 10 }]}
                  onPress={() => setShowExpiryPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[{ flex: 1, fontSize: 15 }, expiry ? { color: '#fff' } : { color: '#475569' }]}>
                    {expiry || 'MM / YY'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
                {errors.expiry && <Text style={s.errorText}>{errors.expiry}</Text>}
              </View>

              <View style={[s.inputGroup, { flex: 1 }]}>
                <Text style={s.label}>CVV</Text>
                <View style={[s.inputWrap, errors.cvv ? s.inputError : null]}>
                  <TextInput
                    style={s.input}
                    placeholder="123"
                    placeholderTextColor="#475569"
                    value={cvc}
                    onChangeText={setCvc}
                    keyboardType="number-pad"
                    maxLength={3}
                    autoComplete="cc-csc"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="none"
                  />
                  <Ionicons name="help-circle-outline" size={22} color="#94a3b8" />
                </View>
                {errors.cvv && <Text style={s.errorText}>{errors.cvv}</Text>}
              </View>
            </View>

            <TouchableOpacity 
              style={s.checkboxRow} 
              onPress={() => setSaveCard(!saveCard)}
              activeOpacity={0.8}
            >
              <View style={[s.checkbox, saveCard && s.checkboxActive]}>
                {saveCard && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={s.checkboxLabel}>Save this card for faster payments</Text>
            </TouchableOpacity>

          </View>
        )}

        {/* TAB CONTENT: WALLET */}
        {activeTab === 'wallet' && (
          <View style={s.walletContainer}>
            {WALLETS.map(w => (
              <View key={w.id}>
                <TouchableOpacity 
                  style={s.walletItem} 
                  onPress={() => setSelectedWallet(selectedWallet === w.id ? null : w.id)}
                  activeOpacity={0.8}
                >
                  <View style={[s.walletIconBox, { backgroundColor: `${w.color}20` }]}>
                    <MaterialCommunityIcons name={w.icon as any} size={24} color={w.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={s.walletName}>{w.name}</Text>
                    <Text style={s.walletSub}>{w.sub}</Text>
                  </View>
                  <Ionicons name={selectedWallet === w.id ? "chevron-down" : "chevron-forward"} size={20} color="#64748b" />
                </TouchableOpacity>

                {selectedWallet === w.id && ['mcash', 'ezcash'].includes(w.id) && (
                  <View style={s.walletForm}>
                    <Text style={s.label}>Mobile Number</Text>
                    <View style={[s.inputWrap, errors.walletPhone ? s.inputError : null]}>
                      <TextInput
                        style={s.input}
                        placeholder="07X XXX XXXX"
                        placeholderTextColor="#475569"
                        value={walletPhone}
                        onChangeText={setWalletPhone}
                        keyboardType="phone-pad"
                        maxLength={10}
                      />
                    </View>
                    {errors.walletPhone && <Text style={s.errorText}>{errors.walletPhone}</Text>}
                    
                    {w.id === 'mcash' && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={s.label}>Wallet PIN</Text>
                        <View style={[s.inputWrap, errors.walletPin ? s.inputError : null]}>
                          <TextInput
                            style={s.input}
                            placeholder="****"
                            placeholderTextColor="#475569"
                            value={walletPin}
                            onChangeText={setWalletPin}
                            keyboardType="number-pad"
                            secureTextEntry={!showPin}
                            maxLength={6}
                          />
                          <TouchableOpacity onPress={() => setShowPin(!showPin)} style={{ paddingHorizontal: 8 }}>
                            <Ionicons name={showPin ? "eye" : "eye-off"} size={18} color="#94a3b8" />
                          </TouchableOpacity>
                        </View>
                        {errors.walletPin && <Text style={s.errorText}>{errors.walletPin}</Text>}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* TAB CONTENT: BANK (Mock Grid) */}
        {activeTab === 'bank' && (
          <View style={s.bankGrid}>
            {BANKS.map(b => (
              <TouchableOpacity key={b.id} style={s.bankItem}>
                <View style={[s.bankIconBox, { backgroundColor: `${b.color}15` }]}>
                  <MaterialCommunityIcons name={b.icon as any} size={28} color={b.color} />
                </View>
                <Text style={s.bankName}>{b.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FIXED FOOTER */}
      <View style={s.footer}>
        <TouchableOpacity style={s.payBtn} onPress={handlePay} activeOpacity={0.9}>
          <Ionicons name="lock-closed" size={18} color="#fff" />
          <Text style={s.payBtnText}>Pay LKR {finalTotal.toLocaleString()}.00</Text>
        </TouchableOpacity>
        
        <View style={s.footerSecurity}>
          <Ionicons name="shield-checkmark" size={14} color="#10b981" />
          <Text style={s.footerSecurityText}>Your payment is protected by 256-bit SSL encryption</Text>
        </View>

        <View style={s.footerLogos}>
          <FontAwesome5 name="cc-visa" size={32} color="#94a3b8" style={{ marginHorizontal: 12 }} />
          <FontAwesome5 name="cc-mastercard" size={32} color="#94a3b8" style={{ marginHorizontal: 12 }} />
          <MaterialCommunityIcons name="shield-lock" size={32} color="#94a3b8" style={{ marginHorizontal: 12 }} />
        </View>
      </View>

      {/* EXPIRY PICKER MODAL */}
      <Modal visible={showExpiryPicker} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Expiry Date</Text>
              <TouchableOpacity onPress={() => setShowExpiryPicker(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.modalScroll}>
              <View style={s.expiryGrid}>
                {EXPIRY_OPTIONS.map(opt => (
                  <TouchableOpacity 
                    key={opt} 
                    style={[s.expiryTile, expiry === opt && s.expiryTileActive]}
                    onPress={() => { setExpiry(opt); setShowExpiryPicker(false); }}
                  >
                    <Text style={[s.expiryTileText, expiry === opt && s.expiryTileTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0D17' }, // Deep Figma Navy background
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#f8fafc' },
  
  scroll: { flex: 1 },
  content: { padding: 20 },

  // Summary
  summaryCard: { backgroundColor: '#131524', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#1F223B' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#f8fafc', marginBottom: 16 },
  sectionSub: { fontSize: 13, color: '#94a3b8', marginTop: -12, marginBottom: 16 },
  
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  itemIconWrap: { width: 44, height: 44, backgroundColor: '#2E1A5E', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemImage: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1F223B' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#e2e8f0' },
  itemSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '600', color: '#f8fafc' },
  
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: '#94a3b8', fontSize: 14 },
  discountValue: { color: '#10b981', fontSize: 14, fontWeight: '500' },
  summaryValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
  
  divider: { height: 1, backgroundColor: '#1F223B', marginVertical: 12 },
  
  totalLabel: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  totalValue: { color: '#A78BFA', fontSize: 16, fontWeight: '700' }, // Light purple matching Figma

  // Tabs
  tabsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#131524', marginHorizontal: 4, borderWidth: 1, borderColor: 'transparent' },
  tabActive: { backgroundColor: '#2E1A5E', borderColor: '#7C3AED' },
  tabIconBox: { marginBottom: 8 },
  tabIconBoxActive: { },
  tabLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  tabLabelActive: { color: '#fff' },

  // Form Base
  formContainer: { backgroundColor: '#131524', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1F223B' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2D304B', paddingBottom: 8 },
  inputError: { borderBottomColor: '#ef4444' },
  input: { flex: 1, color: '#fff', fontSize: 15, backgroundColor: 'transparent', outlineStyle: 'none' as any },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row' },
  
  // Checkbox
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#475569', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  checkboxLabel: { color: '#cbd5e1', fontSize: 13 },

  // Wallets
  walletContainer: { backgroundColor: '#131524', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F223B' },
  walletItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1F223B' },
  walletIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  walletName: { fontSize: 15, fontWeight: '600', color: '#e2e8f0' },
  walletSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  walletForm: { padding: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, marginTop: 8, marginBottom: 8 },

  // Banks
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', backgroundColor: '#131524', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F223B' },
  bankItem: { width: '30%', alignItems: 'center', marginBottom: 20 },
  bankIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  bankName: { fontSize: 11, color: '#94a3b8', textAlign: 'center' },

  // Footer
  footer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, backgroundColor: '#0B0D17', borderTopWidth: 1, borderTopColor: '#1F223B' },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 16, marginBottom: 16 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  
  footerSecurity: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  footerSecurityText: { color: '#10b981', fontSize: 11, marginLeft: 6 },
  
  footerLogos: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#131524', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: 400, paddingBottom: 20, borderWidth: 1, borderColor: '#1F223B' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1F223B' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#f8fafc' },
  modalScroll: { padding: 20 },
  expiryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  expiryTile: { width: '31%', backgroundColor: '#0B0D17', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#1F223B' },
  expiryTileActive: { borderColor: '#7C3AED', backgroundColor: '#2E1A5E' },
  expiryTileText: { fontSize: 15, color: '#94a3b8', fontWeight: '500' },
  expiryTileTextActive: { color: '#fff', fontWeight: '700' },
});
