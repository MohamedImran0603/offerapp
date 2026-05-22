import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';
import { signInWithGoogleWeb } from '../src/lib/auth/googleAuth';

export default function GoogleSignInButton() {
  const handlePress = async () => {
    try {
      await signInWithGoogleWeb();
    } catch (e) {
      console.error('Google sign‑in error', e);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
        <View style={styles.icon} />
      <Text style={styles.text}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { width: 24, height: 24, marginRight: 10 },
  text: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
