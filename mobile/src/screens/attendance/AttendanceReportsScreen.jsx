import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FileBarChart, Download } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import apiClient from '../../api/client';

export default function AttendanceReportsScreen() {
  const [downloading, setDownloading] = useState(false);

  const downloadReport = async () => {
    try {
      setDownloading(true);
      const res = await apiClient.get('/attendance/reports/excel', {
        responseType: 'text' // CSV
      });
      
      const fileUri = FileSystem.documentDirectory + `attendance_report_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, res.data);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', 'File downloaded, but sharing is not available.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FileBarChart size={48} color="#CBD5E1" />
        <Text style={styles.title}>Attendance Reports</Text>
        <Text style={styles.subtitle}>Download comprehensive attendance reports including work done summaries.</Text>
        
        <TouchableOpacity style={styles.button} onPress={downloadReport} disabled={downloading}>
          <Download size={20} color="#FFF" />
          <Text style={styles.buttonText}>{downloading ? 'Downloading...' : 'Export CSV'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center', marginBottom: 24 },
  button: { flexDirection: 'row', backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', gap: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});
