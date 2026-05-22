import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
  Easing,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../src/lib/CartContext';

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

const SRI_LANKAN_BANKS = [
  'Commercial Bank', 'Sampath Bank', 'HNB', "People's Bank", 'Bank of Ceylon',
  'Seylan Bank', 'NDB Bank', 'Nations Trust Bank', 'DFCC Bank', 'Pan Asia Bank',
  'Union Bank', 'Cargills Bank', 'Amana Bank', 'LOLC Finance',
  'Hatton National Bank', 'HSBC Sri Lanka', 'Standard Chartered Sri Lanka',
  'NSB', 'Regional Development Bank',
];

const SRI_LANKAN_WALLETS = [
  'Frimi', 'Genie', 'eZ Cash', 'mCash', 'OnePay', 'PayHere',
];

const PAYMENT_METHODS = [
  { key: 'visa',       label: 'Visa',              icon: 'card',               lib: 'Ionicons' },
  { key: 'mastercard', label: 'Mastercard',         icon: 'credit-card',        lib: 'FontAwesome5' },
  { key: 'debit',      label: 'Debit Card',         icon: 'card-outline',       lib: 'Ionicons' },
  { key: 'qr',         label: 'QR Payment',         icon: 'qr-code',           lib: 'MaterialIcons' },
  { key: 'wallet',     label: 'Mobile Wallet',      icon: 'wallet',             lib: 'Ionicons' },
  { key: 'bank',       label: 'Internet Banking',   icon: 'bank',              lib: 'MaterialCommunityIcons' },
  { key: 'emi',        label: 'EMI Installments',   icon: 'calendar-outline',   lib: 'Ionicons' },
  { key: 'cash',       label: 'Cash on Delivery',   icon: 'cash',              lib: 'Ionicons' },
  { key: 'crypto',     label: 'Crypto Pay',         icon: 'logo-bitcoin',       lib: 'Ionicons' },
] as const;

const MOCK_TRANSACTIONS = [
  { id: '1', title: 'Keells Super',      date: 'Today, 2:15 PM',    method: 'Visa •4287',       amount: -3450,   cashback: 103, icon: 'cart' },
  { id: '2', title: 'Frimi Topup',       date: 'Yesterday, 6:30 PM',method: 'Wallet',           amount: 5000,    cashback: 0,   icon: 'wallet' },
  { id: '3', title: 'Apollo Hospital',   date: '20 May',            method: 'Net Banking',      amount: -12800,  cashback: 0,   icon: 'medkit' },
  { id: '4', title: 'Cashback Credited', date: '19 May',            method: 'HNB Promotion',    amount: 500,     cashback: 0,   icon: 'gift' },
];

/* ──────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────── */

export default function PaymentGatewayScreen() {
  const colorScheme = useColorScheme();
  const isDark = true; // force dark for premium fintech look
  const router = useRouter();

  // State
  const [selectedMethod, setSelectedMethod] = useState('visa');
  const [selectedBank, setSelectedBank] = useState('Commercial Bank');
  const [selectedWallet, setSelectedWallet] = useState('Frimi');
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Animation
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const { total: cartTotal } = useCart();

  // Price breakdown (Dynamic from Cart)
  const subtotal = cartTotal > 0 ? cartTotal : 0;
  const delivery = subtotal > 0 ? 250 : 0;
  const discount = subtotal > 0 ? (subtotal * 0.05 > 500 ? 500 : Math.round(subtotal * 0.05)) : 0;
  const cashback = subtotal > 0 ? 250 : 0;
  const tax = subtotal > 0 ? Math.round((subtotal + delivery - discount) * 0.18 * 100) / 100 : 0;
  const total = subtotal > 0 ? subtotal + delivery - discount - cashback + tax : 0;

  const handlePay = () => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const closeSuccess = () => {
    Animated.parallel([
      Animated.timing(successScale, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccess(false));
  };

  /* ─── Icon renderer ─── */
  const renderIcon = (iconName: string, lib: string, size = 28, color = '#60a5fa') => {
    switch (lib) {
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} size={size} color={color} />;
      default:
        return <Ionicons name={iconName as any} size={size} color={color} />;
    }
  };

  /* ─── RENDER ─── */
  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ───── HEADER ───── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Secure Checkout</Text>
          <View style={s.sslRow}>
            <Ionicons name="lock-closed" size={16} color="#facc15" />
            <Text style={s.sslText}> 100% Secure</Text>
          </View>
        </View>

        {/* ───── AI OFFER BANNER ───── */}
        <View style={s.offerBanner}>
          <MaterialCommunityIcons name="robot-happy" size={20} color="#a78bfa" />
          <Text style={s.offerBannerText}>  AI Offers: 10% Cashback + Free Delivery for new users!</Text>
        </View>

        {/* ───── 9 PAYMENT METHOD TILES (3×3 grid) ───── */}
        <Text style={s.sectionLabel}>Select Payment Method</Text>
        <View style={s.methodGrid}>
          {PAYMENT_METHODS.map(m => {
            const active = selectedMethod === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[s.methodTile, active && s.methodTileActive]}
                onPress={() => setSelectedMethod(m.key)}
                activeOpacity={0.7}
              >
                {renderIcon(m.icon, m.lib, 26, active ? '#7dd3fc' : '#94a3b8')}
                <Text style={[s.methodTileLabel, active && s.methodTileLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ───── CONDITIONAL: BANK PICKER ───── */}
        {selectedMethod === 'bank' && (
          <View style={s.pickerWrap}>
            <Text style={s.pickerTitle}>Select Sri Lankan Bank</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
              {SRI_LANKAN_BANKS.map(bank => (
                <TouchableOpacity
                  key={bank}
                  style={[s.chip, selectedBank === bank && s.chipActive]}
                  onPress={() => setSelectedBank(bank)}
                >
                  <MaterialCommunityIcons name="bank" size={14} color={selectedBank === bank ? '#0ea5e9' : '#64748b'} />
                  <Text style={[s.chipText, selectedBank === bank && s.chipTextActive]}> {bank}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ───── CONDITIONAL: WALLET PICKER ───── */}
        {selectedMethod === 'wallet' && (
          <View style={s.pickerWrap}>
            <Text style={s.pickerTitle}>Select Wallet / Payment App</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
              {SRI_LANKAN_WALLETS.map(w => (
                <TouchableOpacity
                  key={w}
                  style={[s.chip, selectedWallet === w && s.chipActive]}
                  onPress={() => setSelectedWallet(w)}
                >
                  <Ionicons name="wallet" size={14} color={selectedWallet === w ? '#0ea5e9' : '#64748b'} />
                  <Text style={[s.chipText, selectedWallet === w && s.chipTextActive]}> {w}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ───── SAVED CARDS ───── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionLabel}>Saved Cards</Text>
          <TouchableOpacity onPress={() => setIsAddingNewCard(!isAddingNewCard)}>
            <Text style={s.linkText}>{isAddingNewCard ? 'Cancel' : '+ Add New'}</Text>
          </TouchableOpacity>
        </View>

        {/* ───── CARD ENTRY FORM (Toggled by + Add New or card method) ───── */}
        {(isAddingNewCard || (['visa', 'mastercard', 'debit'].includes(selectedMethod) && !isAddingNewCard)) && (
          <View style={s.cardForm}>
            <Text style={s.pickerTitle}>Enter Card Details</Text>
            <TextInput
              style={s.input}
              placeholder="Card Number"
              placeholderTextColor="#475569"
              value={cardNumber}
              onChangeText={t => setCardNumber(t.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
              keyboardType="number-pad"
              maxLength={19}
            />
            <View style={s.cardRow}>
              <TextInput
                style={[s.input, { flex: 1, marginRight: 8 }]}
                placeholder="MM/YY"
                placeholderTextColor="#475569"
                value={expiry}
                onChangeText={setExpiry}
                maxLength={5}
              />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="CVC"
                placeholderTextColor="#475569"
                value={cvc}
                onChangeText={setCvc}
                keyboardType="number-pad"
                maxLength={3}
                secureTextEntry
              />
            </View>
            <TextInput
              style={s.input}
              placeholder="Cardholder Name"
              placeholderTextColor="#475569"
              value={cardName}
              onChangeText={setCardName}
            />
          </View>
        )}
        <TouchableOpacity style={s.savedCard}>
          <Ionicons name="card" size={22} color="#3b82f6" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={s.savedCardTitle}>Visa •••• 4287</Text>
            <Text style={s.savedCardSub}>Commercial Bank</Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color="#4ade80" />
        </TouchableOpacity>
        <TouchableOpacity style={s.savedCard}>
          <FontAwesome5 name="credit-card" size={20} color="#f97316" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={s.savedCardTitle}>Mastercard •••• 8912</Text>
            <Text style={s.savedCardSub}>Sampath Bank</Text>
          </View>
          <View style={s.radioEmpty} />
        </TouchableOpacity>

        {/* ───── PRICE BREAKDOWN (matches screenshot) ───── */}
        <View style={s.breakdownCard}>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>Subtotal</Text>
            <Text style={s.breakdownValue}>LKR {subtotal.toLocaleString()}.00</Text>
          </View>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>Delivery</Text>
            <Text style={s.breakdownValue}>LKR {delivery.toLocaleString()}.00</Text>
          </View>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>Offer Discount 🏷️</Text>
            <Text style={[s.breakdownValue, { color: '#f87171' }]}>−LKR {discount.toLocaleString()}.00</Text>
          </View>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>Cashback 💰</Text>
            <Text style={[s.breakdownValue, { color: '#f87171' }]}>−LKR {cashback.toLocaleString()}.00</Text>
          </View>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>Tax (VAT 18%)</Text>
            <Text style={s.breakdownValue}>LKR {tax.toLocaleString()}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.breakdownRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>LKR {total.toLocaleString()}</Text>
          </View>

          {/* SSL badge */}
          <View style={s.sslBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#4ade80" />
            <Text style={s.sslBadgeText}> 256-bit SSL Encrypted · 100% Secure Payments</Text>
          </View>

          {/* PAY BUTTON */}
          <TouchableOpacity style={s.payBtn} onPress={handlePay} activeOpacity={0.8}>
            <Ionicons name="flash" size={18} color="#000" />
            <Text style={s.payBtnText}>  Pay LKR {total.toLocaleString()} Now</Text>
          </TouchableOpacity>

          <Text style={s.poweredBy}>Powered by OfferPay LK · PCI-DSS Compliant</Text>
        </View>

        {/* ───── TRANSACTION HISTORY (matches screenshot) ───── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionLabel}>Transaction History</Text>
          <TouchableOpacity><Text style={s.linkText}>Full History →</Text></TouchableOpacity>
        </View>
        {MOCK_TRANSACTIONS.map(tx => (
          <View key={tx.id} style={s.txRow}>
            <View style={[s.txIcon, { backgroundColor: tx.amount > 0 ? '#064e3b' : '#1e1b4b' }]}>
              <Ionicons name={tx.icon as any} size={20} color={tx.amount > 0 ? '#34d399' : '#a78bfa'} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.txTitle}>{tx.title}</Text>
              <Text style={s.txSub}>{tx.date} · {tx.method}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[s.txAmount, { color: tx.amount > 0 ? '#34d399' : '#f87171' }]}>
                {tx.amount > 0 ? '+' : '−'}LKR {Math.abs(tx.amount).toLocaleString()}
              </Text>
              {tx.cashback > 0 && (
                <Text style={s.txCashback}>+LKR {tx.cashback} CB</Text>
              )}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ───── PAYMENT SUCCESS OVERLAY (matches screenshot) ───── */}
      {showSuccess && (
        <Animated.View style={[s.successOverlay, { opacity: successOpacity }]}>
          <Animated.View style={[s.successCard, { transform: [{ scale: successScale }] }]}>
            {/* Header */}
            <View style={s.successHeader}>
              <Ionicons name="checkmark-done" size={18} color="#4ade80" />
              <Text style={s.successHeaderText}>  Payment Success</Text>
            </View>

            {/* Circle check */}
            <View style={s.successCircle}>
              <Ionicons name="checkmark" size={48} color="#4ade80" />
            </View>

            <Text style={s.successTitle}>Payment Successful!</Text>
            <Text style={s.successSub}>Your order has been confirmed 🎉</Text>

            {/* Receipt details */}
            <View style={s.receiptCard}>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Amount Paid</Text>
                <Text style={s.receiptValue}>LKR {total.toLocaleString()}</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Method</Text>
                <Text style={s.receiptValue}>Visa •4287</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Transaction ID</Text>
                <Text style={s.receiptValue}>OPL-2026-48291</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Cashback</Text>
                <Text style={[s.receiptValue, { color: '#4ade80' }]}>LKR 103 earned ✓</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Status</Text>
                <Text style={[s.receiptValue, { color: '#4ade80' }]}>Completed</Text>
              </View>
            </View>

            <TouchableOpacity style={s.receiptBtn} onPress={closeSuccess} activeOpacity={0.8}>
              <Text style={s.receiptBtnText}>View Receipt →</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

/* ──────────────────────────────────────────────
   STYLES – Premium dark fintech theme
   ────────────────────────────────────────────── */

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 64) / 3;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a1a' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 48 },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#e2e8f0' },
  sslRow: { flexDirection: 'row', alignItems: 'center' },
  sslText: { fontSize: 13, color: '#4ade80', fontWeight: '600' },

  /* Offer banner */
  offerBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(139,92,246,0.15)', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' },
  offerBannerText: { color: '#c4b5fd', fontSize: 13, fontWeight: '500', flex: 1 },

  /* Section labels */
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#cbd5e1', marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 24 },
  linkText: { fontSize: 13, color: '#38bdf8', fontWeight: '500' },

  /* 3×3 method grid */
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  methodTile: {
    width: TILE_SIZE,
    height: TILE_SIZE * 0.85,
    backgroundColor: 'rgba(30,30,60,0.7)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(100,116,139,0.25)',
  },
  methodTileActive: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56,189,248,0.1)',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  methodTileLabel: { fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'center', fontWeight: '500' },
  methodTileLabelActive: { color: '#7dd3fc' },

  /* Chip pickers (banks / wallets) */
  pickerWrap: { marginBottom: 16 },
  pickerTitle: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 8 },
  chipScroll: { flexDirection: 'row' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,30,60,0.6)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: 'rgba(100,116,139,0.2)' },
  chipActive: { borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.15)' },
  chipText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  chipTextActive: { color: '#7dd3fc' },

  /* Card form */
  cardForm: { marginBottom: 16 },
  input: { backgroundColor: 'rgba(30,30,60,0.8)', borderRadius: 10, padding: 14, color: '#e2e8f0', fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(100,116,139,0.2)' },
  cardRow: { flexDirection: 'row' },

  /* Saved cards */
  savedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,30,60,0.6)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(100,116,139,0.15)' },
  savedCardTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  savedCardSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  radioEmpty: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#475569' },

  /* Price breakdown */
  breakdownCard: { backgroundColor: 'rgba(15,15,40,0.9)', borderRadius: 16, padding: 20, marginTop: 20, borderWidth: 1, borderColor: 'rgba(100,116,139,0.2)' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  breakdownLabel: { fontSize: 14, color: '#94a3b8' },
  breakdownValue: { fontSize: 14, color: '#e2e8f0', fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(100,116,139,0.2)', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#e2e8f0' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#4ade80' },

  sslBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)' },
  sslBadgeText: { fontSize: 11, color: '#4ade80', fontWeight: '500' },

  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', borderRadius: 12, paddingVertical: 16, marginTop: 16 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#0f0f2a' },

  poweredBy: { textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 12 },

  /* Transaction history */
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,30,60,0.5)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(100,116,139,0.1)' },
  txIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  txSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  txCashback: { fontSize: 11, color: '#4ade80', marginTop: 2 },

  /* Success overlay */
  successOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  successCard: { width: width * 0.88, backgroundColor: '#0a1f1a', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  successHeader: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 24 },
  successHeaderText: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  successCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#4ade80', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#4ade80', marginBottom: 4 },
  successSub: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },

  receiptCard: { width: '100%', backgroundColor: 'rgba(15,40,30,0.6)', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(74,222,128,0.15)' },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  receiptLabel: { fontSize: 13, color: '#94a3b8' },
  receiptValue: { fontSize: 13, color: '#e2e8f0', fontWeight: '600' },

  receiptBtn: { width: '100%', borderRadius: 12, borderWidth: 1.5, borderColor: '#4ade80', paddingVertical: 14, alignItems: 'center' },
  receiptBtnText: { color: '#4ade80', fontSize: 15, fontWeight: '600' },
});
