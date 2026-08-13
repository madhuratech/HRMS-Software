import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileBarChart } from 'lucide-react-native';

export default function AttendanceReportsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FileBarChart size={48} color="#CBD5E1" />
        <Text style={styles.title}>Attendance Reports</Text>
        <Text style={styles.subtitle}>Report generation is coming soon.</Text>
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
