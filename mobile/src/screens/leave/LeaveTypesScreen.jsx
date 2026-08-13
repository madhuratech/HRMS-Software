import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tag } from 'lucide-react-native';

export default function LeaveTypesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Tag size={48} color="#CBD5E1" />
        <Text style={styles.title}>Leave Types</Text>
        <Text style={styles.subtitle}>Configure leave types here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center' }
});
