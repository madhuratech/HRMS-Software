import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function KnowledgeBaseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>KnowledgeBase</Text>
      <Text style={styles.subtitle}>This screen is under construction.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 10,
  }
});
