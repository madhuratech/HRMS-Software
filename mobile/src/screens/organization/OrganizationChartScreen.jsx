import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Network, Info, ArrowLeft, User, Briefcase, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function OrganizationChartScreen() {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/employee');
      if (Array.isArray(res.data)) {
        // Sort by role (Super Admin first), then by joining date
        const sorted = res.data.sort((a, b) => {
          if (a.role === 'Super Admin' && b.role !== 'Super Admin') return -1;
          if (a.role !== 'Super Admin' && b.role === 'Super Admin') return 1;
          if (a.role === 'Admin' && b.role !== 'Admin') return -1;
          if (a.role !== 'Admin' && b.role === 'Admin') return 1;
          
          const dateA = new Date(a.joining_date || 0);
          const dateB = new Date(b.joining_date || 0);
          return dateA - dateB;
        });
        setEmployees(sorted);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Organization Chart</Text>
            <Text style={styles.headerSubtitle}>View company hierarchy</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : employees.length === 0 ? (
          <View style={styles.chartContainer}>
            <View style={styles.iconWrapper}>
              <Network size={56} color="#4F46E5" />
            </View>
            <Text style={styles.emptyTitle}>No Employees Found</Text>
            <Text style={styles.placeholderText}>
              There are no employees to display in the organization chart.
            </Text>
          </View>
        ) : (
          <View style={styles.treeContainer}>
            {employees.map((emp, index) => (
              <View key={emp.id || index} style={styles.treeNode}>
                {index !== 0 && <View style={styles.connector} />}
                <View style={[
                  styles.empCard,
                  emp.role === 'Super Admin' && styles.superAdminCard,
                  emp.role === 'Admin' && styles.adminCard
                ]}>
                  <View style={styles.avatarBox}>
                    <User size={24} color="#FFF" />
                  </View>
                  <View style={styles.empDetails}>
                    <Text style={styles.empName}>{emp.first_name} {emp.last_name}</Text>
                    <View style={styles.detailRow}>
                      <Briefcase size={14} color="#64748B" />
                      <Text style={styles.empRole}>{emp.role}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Calendar size={14} color="#64748B" />
                      <Text style={styles.empDate}>Joined: {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'N/A'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 24, 
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  content: { padding: 24 },
  chartContainer: { 
    alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, padding: 32, 
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
    marginTop: 20
  },
  iconWrapper: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#C7D2FE'
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  placeholderText: { textAlign: 'center', color: '#64748B', fontSize: 15, marginBottom: 32, lineHeight: 24, paddingHorizontal: 10 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  treeContainer: { paddingVertical: 20, alignItems: 'center' },
  treeNode: { alignItems: 'center', width: '100%' },
  connector: { width: 2, height: 30, backgroundColor: '#CBD5E1' },
  empCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '90%',
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 2
  },
  superAdminCard: { borderColor: '#4F46E5', borderWidth: 2 },
  adminCard: { borderColor: '#6366F1', borderWidth: 1.5 },
  avatarBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  empDetails: { flex: 1 },
  empName: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  empRole: { fontSize: 14, color: '#475569', fontWeight: '600' },
  empDate: { fontSize: 13, color: '#64748B' }
});
