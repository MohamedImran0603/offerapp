import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { useCards } from '../../src/lib/CardContext';
import { luhnCheck } from '../../src/lib/paymentUtils';

export default function CardsScreen() {
  const router = useRouter();
  const { cards, addCard, removeCard, loadCards } = useCards();

  const [number, setNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [brand, setBrand] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  const handleAdd = async () => {
    if (!number || !holderName || !expiry || !brand) {
      Alert.alert('Missing fields', 'Please fill all fields');
      return;
    }
    if (!luhnCheck(number.replace(/\s+/g, ''))) {
      Alert.alert('Invalid card', 'Card number failed validation');
      return;
    }
    try {
      await addCard({ number: number.replace(/\s+/g, ''), holderName, expiry, brand });
      setNumber('');
      setHolderName('');
      setExpiry('');
      setBrand('');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to add card');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardItem}>
      <Text style={styles.cardNumber}>•••• •••• •••• {item.number.slice(-4)}</Text>
      <Text style={styles.cardInfo}>{item.brand} • {item.holderName}</Text>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => removeCard(item.id)}>
        <Text style={styles.deleteTxt}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>My Cards</Text>
      <FlatList data={cards} keyExtractor={item => item.id} renderItem={renderItem} ListEmptyComponent={<Text style={styles.empty}>No cards added yet.</Text>} />
      <View style={styles.form}>
        <TextInput placeholder='Card Number (16 digits)' value={number} onChangeText={setNumber} style={styles.input} keyboardType='numeric' />
        <TextInput placeholder='Holder Name' value={holderName} onChangeText={setHolderName} style={styles.input} />
        <TextInput placeholder='Expiry (MM/YY)' value={expiry} onChangeText={setExpiry} style={styles.input} />
        <TextInput placeholder='Brand (Visa, MasterCard...)' value={brand} onChangeText={setBrand} style={styles.input} />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Add Card</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff', paddingHorizontal: 20, paddingTop: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  cardItem: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardNumber: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardInfo: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  deleteBtn: { marginTop: 8, alignSelf: 'flex-start' },
  deleteTxt: { color: '#dc2626', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 20 },
  form: { marginTop: 30 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  addBtn: { backgroundColor: Colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  backBtn: { borderColor: '#6b21a8', borderWidth: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  backBtnText: { color: '#6b21a8', fontWeight: '600' },
});
