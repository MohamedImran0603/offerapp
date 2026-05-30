import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';

// Placeholder data – in a real app this would come from Firestore or an API
const mockOffers = Array.from({ length: 20 }, (_, i) => ({
  id: `offer-${i}`,
  title: `Special Deal ${i + 1}`,
  discount: `${10 + i}% Off`,
  expiry: `Ends in ${24 - i}h`,
  // Using a generic placeholder image; replace with real URLs later
  imageUrl: 'https://via.placeholder.com/300x200.png?text=Offer+' + (i + 1),
}));

export default function FeedScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState(mockOffers);

  // In a real implementation you would fetch offers here, e.g.:
  // useEffect(() => {
  //   fetchOffers().then(setOffers);
  // }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/offer', params: { id: item.id } })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.discount}>{item.discount}</Text>
        <Text style={styles.expiry}>{item.expiry}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={Dimensions.get('window').height}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: '90%',
    height: '60%',
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  info: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  discount: {
    fontSize: 16,
    color: '#e91e63',
    marginBottom: 2,
  },
  expiry: {
    fontSize: 14,
    color: '#757575',
  },
});
