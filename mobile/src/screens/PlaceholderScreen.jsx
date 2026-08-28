import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlaceholderScreen({ route }) {
  const routeName = route.name;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{routeName} Module</Text>
      <Text style={styles.subtext}>Coming Soon in Phase 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  }
});
