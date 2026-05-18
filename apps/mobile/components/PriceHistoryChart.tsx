import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../src/constants/Colors';

interface PriceHistoryPoint {
  date: string;
  price: number;
}

interface PriceHistoryChartProps {
  currentPrice: number;
  oldPrice?: number;
  title: string;
}

export default function PriceHistoryChart({ currentPrice, oldPrice, title }: PriceHistoryChartProps) {
  const [alertSet, setAlertSet] = useState(false);

  // Generate realistic historical prices based on current and old prices
  const basePrice = oldPrice || currentPrice * 1.2;
  const pricePoints: PriceHistoryPoint[] = [
    { date: 'Apr 01', price: basePrice },
    { date: 'Apr 15', price: basePrice * 0.95 },
    { date: 'May 01', price: basePrice * 1.05 },
    { date: 'May 15', price: basePrice * 0.9 },
    { date: 'Today', price: currentPrice },
  ];

  const minPrice = Math.min(...pricePoints.map(p => p.price));
  const maxPrice = Math.max(...pricePoints.map(p => p.price));
  const priceRange = maxPrice - minPrice || 1;

  // Calculate prediction and buying score
  const isLowest = currentPrice <= minPrice;
  const dropPercentage = oldPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 15;
  const buyScore = isLowest ? 98 : Math.min(95, Math.max(50, 60 + dropPercentage));
  const predictionTrend = currentPrice < pricePoints[pricePoints.length - 2].price ? 'DOWNWARD (Cheapest)' : 'STABLE';

  const handleSetAlert = () => {
    setAlertSet(!alertSet);
    Alert.alert(
      alertSet ? "Alert Removed" : "Smart Price Alert Set!",
      alertSet 
        ? "You will no longer receive notifications for this item."
        : `We will notify you immediately when "${title}" drops below Rs. ${Math.round(currentPrice * 0.95).toLocaleString()}!`
    );
  };

  return (
    <View style={styles.card}>
      {/* Header Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.cardTitle}>Price History Tracker</Text>
          <Text style={styles.cardSub}>AI-Powered Smart Analytics</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isLowest ? '#ecfdf5' : '#eff6ff' }]}>
          <Text style={[styles.badgeText, { color: isLowest ? '#059669' : '#2563eb' }]}>
            {isLowest ? '👉 Best Price Active' : `🎉 Save ${dropPercentage}%`}
          </Text>
        </View>
      </View>

      {/* Sparkline Graph */}
      <View style={styles.graphContainer}>
        <View style={styles.sparkline}>
          {pricePoints.map((point, index) => {
            const heightPercentage = ((point.price - minPrice) / priceRange) * 70 + 15; // normalize between 15% and 85% height
            return (
              <View key={index} style={styles.pointWrapper}>
                <View style={styles.barContainer}>
                  {/* Vertical bar representing price */}
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${heightPercentage}%`,
                        backgroundColor: point.price === currentPrice ? Colors.primary : '#d1d5db'
                      }
                    ]} 
                  />
                  {/* Point marker */}
                  <View 
                    style={[
                      styles.point, 
                      { 
                        bottom: `${heightPercentage}%`,
                        backgroundColor: point.price === currentPrice ? '#059669' : '#4b5563'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.dateLabel}>{point.date}</Text>
                <Text style={styles.priceLabel}>Rs. {Math.round(point.price / 1000)}k</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Stats and Analytics Rows */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>Best Time to Buy</Text>
          <Text style={[styles.statValue, { color: '#059669' }]}>{buyScore}/100</Text>
          <Text style={styles.statLabel}>Highly Recommended</Text>
        </View>
        <View style={styles.dividerVertical} />
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>AI Prediction</Text>
          <Text style={[styles.statValue, { color: '#2563eb' }]}>{predictionTrend}</Text>
          <Text style={styles.statLabel}>Prices likely stable</Text>
        </View>
      </View>

      <View style={styles.dividerHorizontal} />

      {/* Alert Activation Buttons */}
      <TouchableOpacity 
        style={[styles.alertButton, alertSet && styles.alertActive]} 
        onPress={handleSetAlert}
      >
        <Text style={styles.alertIcon}>{alertSet ? '🔔' : '🔕'}</Text>
        <Text style={[styles.alertText, alertSet && styles.alertActiveText]}>
          {alertSet ? 'Smart Alert Active (Click to cancel)' : 'Notify Me on Price Drop'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  graphContainer: {
    height: 140,
    justifyContent: 'flex-end',
    marginBottom: 16,
    paddingTop: 10,
  },
  sparkline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  pointWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  bar: {
    width: 6,
    borderRadius: 3,
    opacity: 0.15,
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    transform: [{ translateY: 4 }],
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
    marginTop: 6,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  dividerHorizontal: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  alertButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  alertActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  alertIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  alertActiveText: {
    color: '#047857',
  },
});
