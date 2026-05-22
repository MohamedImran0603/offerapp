import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/Colors';
import { db } from '../src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { mockData } from '../src/lib/mockData';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: any[];
}

export default function AssistantScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "👋 Ayubowan! I am your Offer Lanka AI Assistant. Ask me anything about deals, prices, or stores nearby! \n\nTry asking: \n• 'cheapest iPhone' \n• 'grocery deals at Keells' \n• 'any discounts in Colombo?'",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [allOffers, setAllOffers] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Fetch both live Firestore offers and mock offers on mount
  useEffect(() => {
    const loadOffers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'offers'));
        const liveOffers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Map field names safely
        const normalizedLive = liveOffers.map((o: any) => ({
          ...o,
          newPrice: o.price,
          image: o.imageUrl
        }));
        setAllOffers([...normalizedLive, ...mockData]);
      } catch (error) {
        console.log("Using mock data as fallback for assistant:", error);
        setAllOffers(mockData);
      }
    };
    loadOffers();
  }, []);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputText.toLowerCase().trim();
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // AI Conversational Parser Simulation
    setTimeout(() => {
      let responseText = "";
      let matchedOffers: any[] = [];

      if (query.includes('iphone')) {
        matchedOffers = allOffers.filter(o => (o.title || '').toLowerCase().includes('iphone'));
        if (matchedOffers.length > 0) {
          // Sort by price
          matchedOffers.sort((a, b) => (a.newPrice || a.price || 0) - (b.newPrice || b.price || 0));
          const cheapest = matchedOffers[0];
          responseText = `📱 Found the cheapest iPhone for you! The cheapest active offer is "${cheapest.title}" at Rs. ${(cheapest.newPrice || cheapest.price).toLocaleString()} available at ${cheapest.store}.`;
        } else {
          responseText = "📱 I couldn't find any active iPhone offers in the database currently. Check back later!";
        }
      } else if (query.includes('keells') || query.includes('grocery') || query.includes('cargills') || query.includes('glomark')) {
        const storeMatch = query.includes('keells') ? 'keells' : query.includes('cargills') ? 'cargills' : 'glomark';
        matchedOffers = allOffers.filter(o => (o.store || '').toLowerCase().includes(storeMatch));
        if (matchedOffers.length > 0) {
          responseText = `🛒 I found ${matchedOffers.length} discount offers at ${storeMatch.charAt(0).toUpperCase() + storeMatch.slice(1)}. Here are some highly rated ones:`;
          matchedOffers = matchedOffers.slice(0, 3); // Top 3
        } else {
          responseText = `🛒 No active supermarket flyers found for ${storeMatch}. Try typing another store.`;
        }
      } else if (query.includes('colombo') || query.includes('kandy') || query.includes('gampaha')) {
        const location = query.includes('colombo') ? 'colombo' : query.includes('kandy') ? 'kandy' : 'gampaha';
        matchedOffers = allOffers.filter(o => (o.district || '').toLowerCase().includes(location));
        if (matchedOffers.length > 0) {
          responseText = `📍 Showing live trending discounts within the ${location.charAt(0).toUpperCase() + location.slice(1)} district:`;
          matchedOffers = matchedOffers.slice(0, 3);
        } else {
          responseText = `📍 I couldn't find any active flyers specifically in ${location} district right now.`;
        }
      } else if (query.includes('cheapest') || query.includes('price')) {
        // Find absolute cheapest
        const sorted = [...allOffers].sort((a, b) => (a.newPrice || a.price || 0) - (b.newPrice || b.price || 0));
        matchedOffers = sorted.slice(0, 3);
        responseText = "💸 Here are the overall lowest priced deals active in our database across all categories:";
      } else {
        // General search
        matchedOffers = allOffers.filter(o => 
          (o.title || '').toLowerCase().includes(query) || 
          (o.category || '').toLowerCase().includes(query)
        );
        if (matchedOffers.length > 0) {
          responseText = `🔍 I found matching offers for your query "${inputText}":`;
          matchedOffers = matchedOffers.slice(0, 3);
        } else {
          responseText = "🤔 I didn't quite catch that. Try asking for a specific product (e.g. 'cheapest iPhone'), a supermarket (e.g. 'Keells offers'), or a location (e.g. 'Colombo discounts').";
        }
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: matchedOffers.length > 0 ? matchedOffers : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Scroll to bottom again
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isAi = item.sender === 'ai';
    return (
      <View style={[styles.messageRow, isAi ? styles.rowAi : styles.rowUser]}>
        {isAi && (
          <View style={styles.botAvatar}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={[styles.bubble, isAi ? styles.bubbleAi : styles.bubbleUser]}>
            <Text style={[styles.messageText, isAi ? styles.textAi : styles.textUser]}>
              {item.text}
            </Text>
          </View>

          {/* Render horizontal product cards if AI message has matching offers */}
          {item.suggestions && (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={item.suggestions}
              keyExtractor={(s) => s.id}
              contentContainerStyle={styles.suggestionsContainer}
              renderItem={({ item: suggestion }) => (
                <TouchableOpacity 
                  style={styles.suggestionCard} 
                  onPress={() => router.push(`/offer/${suggestion.id}` as any)}
                >
                  <Text style={styles.sStore}>{suggestion.store}</Text>
                  <Text style={styles.sTitle} numberOfLines={1}>{suggestion.title}</Text>
                  <Text style={styles.sPrice}>Rs. {(suggestion.newPrice || suggestion.price || 0).toLocaleString()}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSub}>Always online</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing indicator */}
        {isTyping && (
          <View style={styles.typingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.typingText}>AI is scanning active catalogs...</Text>
          </View>
        )}

        {/* Chat Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your question..."
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  headerBack: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSub: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  chatList: {
    padding: 16,
    paddingBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  rowAi: {
    alignItems: 'flex-start',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 4,
  },
  bubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bubbleAi: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textAi: {
    color: '#374151',
  },
  textUser: {
    color: '#ffffff',
  },
  suggestionsContainer: {
    paddingTop: 10,
    gap: 10,
  },
  suggestionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    width: 160,
    marginRight: 8,
  },
  sStore: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  sPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 6,
  },
  typingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
