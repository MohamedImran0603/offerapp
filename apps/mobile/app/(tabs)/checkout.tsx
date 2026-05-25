import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/lib/CartContext';
import { luhnCheck } from '../../src/lib/paymentUtils';

const CheckoutScreen = () => {
  const router = useRouter();
  const { total, clearCart } = useCart();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  const handlePay = () => {
    if (!luhnCheck(cardNumber)) {
      Alert.alert('Invalid Card', 'Please enter a valid 16‑digit card number.');
      return;
    }
    if (!expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      Alert.alert('Invalid Expiry', 'Expiry must be in MM/YY format.');
      return;
    }
    if (cvc.length !== 3) {
      Alert.alert('Invalid CVC', 'CVC must be 3 digits.');
      return;
    }
    // Mock order placement
    Alert.alert('Success', `Order placed! Total: Rs. ${total.toLocaleString()}`);
    clearCart();
    router.replace('/(tabs)/home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.cardNumber}>•••• •••• •••• {cardNumber.slice(-4) || '0000'}</Text>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.label}>Cardholder</Text>
            <Text style={styles.value}>{name || 'YOUR NAME'}</Text>
          </View>
          <View>
            <Text style={styles.label}>Expires</Text>
            <Text style={styles.value}>{expiry || 'MM/YY'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.addCardBtn} onPress={() => Alert.alert('Add Card', 'Feature coming soon')}>
        <Text style={styles.addCardBtnText}>Add New Card</Text>
      </TouchableOpacity>

      <View style={styles.form}>
        <TextInput
          placeholder="Card Number"
          keyboardType="numeric"
          maxLength={19}
          style={styles.input}
          value={cardNumber}
          onChangeText={text => setCardNumber(text.replace(/\s+/g, '').replace(/(.{4})/g, '$1 '))}
        />
        <TextInput
          placeholder="Expiry (MM/YY)"
          keyboardType="numeric"
          maxLength={5}
          style={styles.input}
          value={expiry}
          onChangeText={setExpiry}
        />
        <TextInput
          placeholder="CVC"
          keyboardType="numeric"
          maxLength={3}
          style={styles.input}
          value={cvc}
          onChangeText={setCvc}
        />
        <TextInput
          placeholder="Name on Card"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Pay Rs. {total.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#faf3e0', // warm marketplace vibe
  },
  cardContainer: {
    backgroundColor: '#4a148c',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 15,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#ddd',
    fontSize: 12,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    fontSize: 16,
    paddingVertical: 4,
  },
  payButton: {
    backgroundColor: '#ff7043',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  addCardBtn: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  addCardBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
