import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

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
    // Explicitly support remote web URLs and direct Base64 inline strings
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:image/')) {
      return { uri: img };
    }
    return { uri: img.startsWith('file://') ? img : 'file://' + img };
  };

  return (
    <TouchableOpacity 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
      onPress={() => router.push(`/offer/${offer.id}`)}
    >
      <View style={{ flexDirection: 'row' }}>
        <Image 
          source={getImageSource()} 
          style={{ width: 96, height: 96, borderRadius: 12, backgroundColor: '#f1f5f9' }} 
        />
        
        <View style={{
          flex: 1,
          marginLeft: 16,
          justifyContent: 'space-between',
        }}>
          <View>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#ff4757',
              marginBottom: 4,
            }}>{offer.store} • {offer.distanceKm}km</Text>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#1e293b',
            }} numberOfLines={2}>{offer.title}</Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>
            <View>
               <Text style={{
                 fontSize: 18,
                 fontWeight: 'bold',
                 color: '#1e293b',
               }}>Rs {offer.newPrice}</Text>
               <Text style={{
                 fontSize: 14,
                 color: '#94a3b8',
                 textDecorationLine: 'line-through',
               }}>Rs {offer.oldPrice}</Text>
            </View>
            <View style={{
              backgroundColor: '#fee2e2',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: '#ef4444',
              }}>-{offer.discountPercent}%</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
