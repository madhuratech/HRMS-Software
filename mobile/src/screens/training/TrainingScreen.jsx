import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, ScrollView, Alert } from 'react-native';
import { Plus, Search, CheckCircle, Clock, BookOpen, Edit2, Trash2, Calendar, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function TrainingScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [kpiData, setKpiData] = useState({ total: 0, active: 0, completed: 0 });

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, trainingRes] = await Promise.all([
        apiClient.get('/training/dashboard').catch(() => null),
        apiClient.get('/training?page=1&limit=50').catch(() => null)
      ]);

      if (dashboardRes?.data?.success) {
        setKpiData(dashboardRes.data.data);
      }

      if (trainingRes?.data?.success && trainingRes.data.data.training) {
        setData(trainingRes.data.data.training);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching training:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete Training', `Are you sure you want to delete ${item.title || 'this program'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/app/training/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to delete training program');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      if (updatedItem.id) {
        await apiClient.put(`/app/training/${updatedItem.id}`, updatedItem);
      } else {
        await apiClient.post('/app/training', updatedItem);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const filteredData = data.filter(t => 
    (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.instructor || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('completed')) return '#10B981';
    if (s.includes('active')) return '#2563EB';
    if (s.includes('pending')) return '#F59E0B';
    return '#64748B';
  };

  const renderKPIs = () => (
    <View style={styles.kpiContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <BookOpen size={24} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>Total Programs</Text>
          <Text style={styles.kpiValue}>{kpiData.total || 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Target size={24} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>Active</Text>
          <Text style={styles.kpiValue}>{kpiData.active || 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle size={24} color="#10B981" />
          </View>
          <Text style={styles.kpiLabel}>Completed</Text>
          <Text style={styles.kpiValue}>{kpiData.completed || 0}</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.titleText} numberOfLines={2}>{item.title || 'Untitled Program'}</Text>
            <Text style={styles.subtitleText}>Instructor: {item.instructor || 'TBD'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status || 'Active'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
           <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{item.duration || 'N/A'}</Text>
           </View>
           <View style={styles.detailDivider} />
           <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Participants</Text>
              <Text style={styles.detailValue}>{item.participants_count || 0}</Text>
           </View>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.dateText}>
              Start: {item.start_date ? new Date(item.start_date).toLocaleDateString('en-IN') : '--'}
            </Text>
          </View>
          
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionEdit(item)}>
              <Edit2 size={16} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionDelete(item)}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Training</Text>
            <Text style={styles.headerSubtitle}>Manage learning programs</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            setActionSelectedItem({});
            setActionModalMode('add');
            setActionModalVisible(true);
          }}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search training programs..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      </LinearGradient>

      {renderKPIs()}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => (item.id || Math.random()).toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <BookOpen size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No training programs found</Text>
            </View>
          }
        />
      )}

      {actionModalVisible && (
        <ActionModals
          visible={actionModalVisible}
          mode={actionModalMode}
          item={actionSelectedItem}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'Create Program' : 'Edit Program'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  searchRow: { flexDirection: 'row', gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  kpiContainer: { marginVertical: 16 },
  kpiScroll: { paddingHorizontal: 16, gap: 12 },
  kpiCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, minWidth: 140, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  kpiLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  kpiValue: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleText: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  subtitleText: { fontSize: 13, color: '#64748B' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  detailDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0', marginHorizontal: 16 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 15, color: '#94A3B8', fontWeight: '500' }
});
