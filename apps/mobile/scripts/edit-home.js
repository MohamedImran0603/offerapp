const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/(tabs)/home.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Target 1: Add FAB inside the SafeAreaView
const targetFAB = `      </ScrollView>
    </SafeAreaView>`;

const replacementFAB = `      </ScrollView>

      {/* Floating AI Assistant FAB */}
      <TouchableOpacity 
        style={styles.floatingAssistantButton} 
        onPress={() => router.push('/assistant')}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>`;

// Target 2: Add styles inside StyleSheet.create
const targetStyles = `  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },`;

const replacementStyles = `  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  floatingAssistantButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#6200EE', // Primary Colors fallback
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },`;

if (content.includes(targetFAB)) {
  content = content.replace(targetFAB, replacementFAB);
}

if (content.includes(targetStyles)) {
  content = content.replace(targetStyles, replacementStyles);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Home tab file successfully modified!');
