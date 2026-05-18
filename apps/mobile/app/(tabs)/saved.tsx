import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { subscribeToFavorites, subscribeToShoppingList, toggleShoppingItem, toggleFavorite } from '../../src/lib/userService';

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState('Saved offers');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubFavs = subscribeToFavorites((data) => {
      setFavorites(data);
      setLoading(false);
    });
    const unsubList = subscribeToShoppingList((data) => {
      setShoppingList(data);
    });

    return () => {
      unsubFavs();
      unsubList();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          onPress={() => setActiveTab('Saved offers')}
          style={[styles.tab, activeTab === 'Saved offers' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'Saved offers' && styles.tabTextActive]}>Saved offers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('Shopping list')}
          style={[styles.tab, activeTab === 'Shopping list' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'Shopping list' && styles.tabTextActive]}>Shopping list</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === 'Saved offers' ? (
            <View style={styles.content}>
               {favorites.length === 0 ? (
                 <Text style={styles.emptyText}>No saved offers yet.</Text>
               ) : (
                 favorites.map((item) => (
                   <View key={item.id} style={styles.savedCard}>
                      <View style={styles.cardIconBox}>
                         <Text style={{ fontSize: 28 }}>{item.category === 'ELECTRONICS' ? '📱' : '🍏'}</Text>
                      </View>
                      <View style={styles.cardInfo}>
                         <Text style={styles.cardTitle}>{item.title}</Text>
                         <Text style={styles.cardSub}>{item.store} - Rs. {item.newPrice?.toLocaleString()}</Text>
                         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Text style={{ fontSize: 12, marginRight: 4 }}>🕒</Text>
                            <Text style={styles.expiryText}>Saved to cloud</Text>
                         </View>
                      </View>
                      <TouchableOpacity onPress={() => toggleFavorite(item.id, item)}>
                         <Text style={{ fontSize: 20, color: '#ef4444' }}>❤️</Text>
                      </TouchableOpacity>
                   </View>
                 ))
               )}
            </View>
          ) : (
            <View style={styles.content}>
               <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>Shopping list</Text>
                  <View style={styles.itemBadge}>
                     <Text style={styles.itemBadgeText}>{shoppingList.length} items</Text>
                  </View>
               </View>

               <View style={styles.listContainer}>
                  {shoppingList.length === 0 ? (
                    <Text style={styles.emptyText}>Your shopping list is empty.</Text>
                  ) : (
                    shoppingList.map((item) => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={styles.listItem}
                        onPress={() => toggleShoppingItem(item.id, item.checked)}
                      >
                        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                           {item.checked && <Text style={{ color: 'white', fontSize: 10 }}>✓</Text>}
                        </View>
                        <Text style={[styles.itemLabel, item.checked && styles.itemLabelChecked]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.itemPrice, item.checked && styles.itemPriceChecked]}>
                          Rs. {item.price?.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
               </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  cardIconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  expiryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  itemBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    gap: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  itemLabelChecked: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  itemPriceChecked: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9ca3af',
    fontSize: 14,
  }
});
