import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert, Linking } from 'react-native';
import { Search, Plus, Trash2, Folder, FileText, Download, Calendar, ExternalLink } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function CompanyDocumentsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/documents/company?category=all`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching company documents:', error);
      setData([]);
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
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete Document', `Are you sure you want to delete ${item.document_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/documents/company/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to delete document');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    // Requires multipart/form-data for uploads. Handled via modal or simple fallback if just meta-data.
    try {
      await apiClient.post('/documents/company', updatedItem);
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const filteredData = data.filter(item => 
    (item.document_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.document_category || '').toLowerCase().includes(search.toLowerCase())
  );

  const openDocument = (url) => {
    if (url) Linking.openURL(url);
  };

  const renderItem = ({ item }) => {
    const isPdf = item.file_path && item.file_path.toLowerCase().endsWith('.pdf');
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            {isPdf ? <FileText size={20} color="#DC2626" /> : <Folder size={20} color="#2563EB" />}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.docName} numberOfLines={1}>{item.document_name}</Text>
            <Text style={styles.docCategory}>{item.document_category}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN') : '--'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#DCFCE7' : '#F1F5F9' }]}>
            <Text style={[styles.statusText, { color: item.status === 'Active' ? '#15803D' : '#475569' }]}>
              {item.status || 'Active'}
            </Text>
          </View>
          
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openDocument(item.file_path)}>
              <ExternalLink size={16} color="#2563EB" />
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
            <Text style={styles.headerTitle}>Company Documents</Text>
            <Text style={styles.headerSubtitle}>Manage shared assets & records</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search documents..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      </LinearGradient>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Folder size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No company documents found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: '#64748B' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  searchRow: { flexDirection: 'row', gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  docCategory: { fontSize: 13, color: '#64748B' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#475569', flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' }
});
