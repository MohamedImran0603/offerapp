import React, { useState, useRef } from 'react';
import { View, Text, Image, SafeAreaView, TouchableOpacity, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { Colors } from '../src/constants/Colors';

const SLIDES = [
  {
    id: '1',
    emoji: '🛒',
    bgColor: '#f0fdf4',
    title: 'Find the best deals near you',
    subtitle: 'Browse offers from 500+ stores across all 25 districts of Sri Lanka'
  },
  {
    id: '2',
    emoji: '🔔',
    bgColor: '#eff6ff',
    title: 'Real-time Promotion Alerts',
    subtitle: 'Get notified instantly when your favorite brands launch new discounts and grocery flyers'
  },
  {
    id: '3',
    emoji: '📍',
    bgColor: '#faf5ff',
    title: 'Localized District Saving',
    subtitle: 'Filter by your closest district to unlock exclusive regional price drops immediately'
  }
];

export default function IndexRedirect() {
  return <Redirect href="/(tabs)/home" />;
}

export function WelcomeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / windowWidth);
    setActiveSlide(index);
  };

  const handleNext = () => {
    if (activeSlide < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeSlide + 1, animated: true });
    } else {
      router.replace('/register');
    }
  };

  const renderSlideItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[styles.slideContainer, { width: windowWidth }]}>
      <View style={[styles.illustrationContainer, { backgroundColor: item.bgColor }]}>
         <View style={styles.illustrationCard}>
            <Text style={{ fontSize: 80 }}>{item.emoji}</Text>
         </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
         <Image 
           source={require('../assets/images/logo.png')} 
           style={styles.logo} 
           resizeMode="contain" 
         />
         <Text style={styles.brandName}>Offer Lanka</Text>
         <Text style={styles.tagline}>දිවයිනේ හොඳම දීමනා</Text>
      </View>

      {/* Dynamic Slide Carousel with FlatList Paging */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlideItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      </View>

      {/* Dynamic Slide Indicator Dots */}
      <View style={styles.indicatorOuterWrapper}>
        <View style={styles.indicatorContainer}>
           {SLIDES.map((_, idx) => (
             <View 
               key={idx} 
               style={[
                 styles.indicator, 
                 activeSlide === idx && { backgroundColor: Colors.primary, width: 24 }
               ]} 
             />
           ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {activeSlide === SLIDES.length - 1 ? 'Get Started' : 'Next Screen ➔'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ marginTop: 16 }}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.secondaryText}>Continue as guest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  tagline: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slideContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  illustrationCard: {
    width: 110,
    height: 110,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  indicatorOuterWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  }
});
