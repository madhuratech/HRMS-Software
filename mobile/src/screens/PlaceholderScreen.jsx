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
    color: '#0F172A',
  },
  subtext: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  }
});
