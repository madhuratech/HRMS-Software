import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FileBarChart, Download, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import apiClient from '../../api/client';

export default function AttendanceReportsScreen({ navigation }) {
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
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Attendance Reports</Text>
            <Text style={styles.headerSubtitle}>Export and analyze data</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <FileBarChart size={48} color="#CBD5E1" />
        <Text style={styles.title}>Attendance Reports</Text>
        <Text style={styles.subtitle}>Download comprehensive attendance reports including work done summaries.</Text>
        
        <TouchableOpacity style={styles.button} onPress={downloadReport} disabled={downloading}>
          <Download size={20} color='#FFFFFF' />
          <Text style={styles.buttonText}>{downloading ? 'Downloading...' : 'Export CSV'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', marginBottom: 24 },
  button: { flexDirection: 'row', backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', gap: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});
