import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useCart } from '../../src/lib/CartContext';
import { useRouter } from 'expo-router';

const CartScreen = () => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>Rs. {item.price.toLocaleString()}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList data={items} renderItem={renderItem} keyExtractor={i => i.id} />
      <View style={styles.summary}>
        <Text style={styles.total}>Total: Rs. {total.toLocaleString()}</Text>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push('/payment')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  itemRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  image: { width: 80, height: 80, borderRadius: 8 },
  info: { flex: 1, marginLeft: 10 },
  title: { fontSize: 16, fontWeight: '600' },
  price: { marginTop: 4, color: '#E53935' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: { padding: 6, backgroundColor: '#ddd', borderRadius: 4 },
  qtyBtnText: { fontSize: 18 },
  qty: { marginHorizontal: 12, fontSize: 16 },
  removeBtn: { marginTop: 8 },
  removeBtnText: { color: '#777' },
  summary: { padding: 15, borderTopWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  total: { fontSize: 18, fontWeight: '600' },
  checkoutBtn: { marginTop: 10, backgroundColor: '#FF9800', padding: 12, borderRadius: 6, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#777' },
});
