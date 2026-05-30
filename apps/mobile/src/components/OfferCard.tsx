import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Shadows } from '../../theme/shadows';

interface OfferCardProps {
  offer: any;
}

export function OfferCard({ offer }: OfferCardProps) {
  const router = useRouter();

  const getImageSource = () => {
    const img = offer.image || offer.imageUrl || '';
    if (!img) {
      return { uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' };
    }
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:image/')) {
      return { uri: img };
    }
    return { uri: img.startsWith('file://') ? img : 'file://' + img };
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/offer/${offer.id}`)}
    >
      <View style={styles.contentRow}>
        <Image source={getImageSource()} style={styles.image} />
        <View style={styles.infoColumn}>
          <View>
            <Text style={styles.storeText}>{offer.store} • {offer.distanceKm}km</Text>
            <Text style={styles.titleText} numberOfLines={2}>{offer.title}</Text>
          </View>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.newPrice}>Rs {offer.newPrice}</Text>
              <Text style={styles.oldPrice}>Rs {offer.oldPrice}</Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{offer.discountPercent}%</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Shadows.card,
  },
  contentRow: {
    flexDirection: 'row',
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  infoColumn: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  storeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  newPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  oldPrice: {
    fontSize: 14,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: Colors.discountBadge,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.buttonDanger,
  },
});
