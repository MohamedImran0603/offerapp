import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

import { Colors } from '../src/constants/Colors';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Offer Lanka</Text>
        <View style={styles.rightIcons}>
          <Text style={styles.icon}>🛒</Text>
          <Text style={styles.icon}>🔔</Text>
        </View>
      </View>

      {/* LOCATION */}
      <View style={styles.locationRow}>
        <TouchableOpacity style={styles.locationBox}>
          <Text style={styles.locationText}>📍 Colombo, Sri Lanka</Text>
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Find all shopping flyers..."
            placeholderTextColor={Colors.textLight}
            style={styles.input}
          />
        </View>
      </View>

      {/* BANNER */}
      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>🔥 Super Offer</Text>
          </View>
          <Text style={styles.bigText}>
            Up to <Text style={{ color: Colors.yellow }}>50% OFF</Text>
          </Text>
          <Text style={styles.subText}>On Your Favorite Brands</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Explore Offers →</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
          }}
          style={styles.burger}
        />
      </View>

      {/* CATEGORY TITLE */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>⭐ Top Categories</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>

      {/* CATEGORY LIST */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['🍔', '🥬', '🥛', '🥩', '🥤', '🍰', '❤️'].map((item, index) => (
          <View key={index} style={styles.categoryCard}>
            <Text style={styles.categoryIcon}>{item}</Text>
          </View>
        ))}
      </ScrollView>

      {/* PRODUCT CARDS */}
      <Text style={styles.sectionTitle}>✨ AI Picks For You</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.productCard}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
              }}
              style={styles.productImage}
            />
            <View style={styles.discount}>
              <Text style={styles.discountText}>-24%</Text>
            </View>
            <Text style={styles.productTitle}>Banana Offer</Text>
            <Text style={styles.productPrice}>Rs. 1,250</Text>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 15,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  rightIcons: {
    flexDirection: 'row',
  },
  icon: {
    fontSize: 24,
    marginLeft: 15,
    color: Colors.white,
  },
  locationRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  locationBox: {
    backgroundColor: Colors.secondary,
    padding: 14,
    borderRadius: 15,
    marginRight: 10,
  },
  locationText: {
    color: Colors.white,
  },
  searchBox: {
    flex: 1,
    backgroundColor: Colors.input,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  input: {
    color: Colors.white,
  },
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    padding: 20,
    flexDirection: 'row',
    marginTop: 25,
    alignItems: 'center',
  },
  offerBadge: {
    backgroundColor: Colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 15,
  },
  offerBadgeText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  bigText: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: 'bold',
  },
  subText: {
    color: Colors.textLight,
    fontSize: 18,
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.white,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  burger: {
    width: 160,
    height: 160,
    borderRadius: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  viewAll: {
    color: Colors.textLight,
  },
  categoryCard: {
    width: 80,
    height: 80,
    backgroundColor: Colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryIcon: {
    fontSize: 30,
  },
  productCard: {
    width: 180,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 10,
    marginRight: 15,
    marginBottom: 30,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: 15,
  },
  discount: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: Colors.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  discountText: {
    color: '#000',
    fontWeight: 'bold',
  },
  productTitle: {
    color: Colors.white,
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    color: Colors.green,
    marginTop: 5,
    fontSize: 16,
  },
});
