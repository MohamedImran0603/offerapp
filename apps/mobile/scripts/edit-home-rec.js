const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/(tabs)/home.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Target 1: Inject imports/state at the beginning of the home component
const targetState = `  const [activeCategory, setActiveCategory] = useState('ALL');`;
const replacementState = `  const [activeCategory, setActiveCategory] = useState('ALL');
  const [clickedCategories, setClickedCategories] = useState<{[key: string]: number}>({
    'Food - Grocery': 2,
    'Electronics': 1
  });

  const recommendedOffers = (offers.length > 0 ? offers : mockData)
    .filter(o => clickedCategories[o.category] && clickedCategories[o.category] > 0)
    .sort((a, b) => (clickedCategories[b.category] || 0) - (clickedCategories[a.category] || 0))
    .slice(0, 5);

  const handleOfferClick = (item: any) => {
    setClickedCategories(prev => ({
      ...prev,
      [item.category]: (prev[item.category] || 0) + 1
    }));
    router.push(\`/offer/\${item.id}\`);
  };`;

// Target 2: Change click handler in the grid from router.push to handleOfferClick
const targetGridClick = `                 onPress={() => router.push(\`/offer/\${item.id}\`)}`;
const replacementGridClick = `                 onPress={() => handleOfferClick(item)}`;

// Target 3: Insert Recommended Section above grid
const targetGridHeader = `        {/* Offers Grid */}`;
const replacementGridHeader = `        {/* AI Personalized Picks Section */}
        {recommendedOffers.length > 0 && (
          <View style={styles.recSection}>
            <View style={styles.recHeaderRow}>
               <Text style={styles.recSectionTitle}>🧠 AI Picks For You</Text>
               <Text style={styles.recSectionSub}>Based on your behavior</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
              {recommendedOffers.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.recCard}
                  onPress={() => handleOfferClick(item)}
                >
                  <Image source={{ uri: item.image }} style={styles.recCardImage} />
                  <View style={styles.recCardContent}>
                     <Text style={styles.recCardStore}>{item.store}</Text>
                     <Text style={styles.recCardTitle} numberOfLines={1}>{item.title}</Text>
                     <Text style={styles.recCardPrice}>Rs. {(item.newPrice || item.price || 0).toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Offers Grid */}`;

// Target 4: Add styles inside StyleSheet.create
const targetStyles = `  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },`;

const replacementStyles = `  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  recSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  recHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  recSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  recSectionSub: {
    fontSize: 11,
    color: '#6b7280',
  },
  recScroll: {
    gap: 12,
    paddingRight: 16,
  },
  recCard: {
    width: 140,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  recCardImage: {
    width: '100%',
    height: 90,
    resizeMode: 'cover',
  },
  recCardContent: {
    padding: 8,
  },
  recCardStore: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6200EE',
    textTransform: 'uppercase',
  },
  recCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginTop: 2,
  },
  recCardPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },`;

if (content.includes(targetState)) {
  content = content.replace(targetState, replacementState);
}
if (content.includes(targetGridClick)) {
  // Replace all matches
  content = content.split(targetGridClick).join(replacementGridClick);
}
if (content.includes(targetGridHeader)) {
  content = content.replace(targetGridHeader, replacementGridHeader);
}
if (content.includes(targetStyles)) {
  content = content.replace(targetStyles, replacementStyles);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ AI Recommendations system successfully injected!');
