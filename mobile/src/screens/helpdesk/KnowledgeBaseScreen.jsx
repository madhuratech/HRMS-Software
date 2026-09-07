import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Plus, Edit2, Eye, Trash2, Search, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function KnowledgeBaseScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action Modals State
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tickets/kb/articles');
      if (res.data && Array.isArray(res.data)) {
        setData(res.data);
      } else if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching kb articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete Article', 'Are you sure you want to delete this article?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          setData(data.filter(d => d.id !== item.id));
      }}
    ]);
  };

  const handleActionSave = async (formData) => {
    try {
      // Simulate backend save since there might not be a POST endpoint yet
      if (actionModalMode === 'create') {
        const newItem = {
          id: Math.random().toString(),
          title: formData.articleTitle,
          cat: formData.category,
          views: '0',
          status: formData.status || 'Published',
          date: new Date().toLocaleDateString('en-GB')
        };
        setData([newItem, ...data]);
      } else {
        // Update logic
      }
      setActionModalVisible(false);
    } catch (err) {
      console.error('Error saving article:', err);
      Alert.alert('Error', 'Failed to save article');
    }
  };

  const kbFields = [
    { name: 'articleTitle', label: 'Article Title', type: 'text', placeholder: 'e.g. How to connect to office VPN', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['IT Support', 'HR Support', 'Payroll', 'Leave & Attendance', 'Training', 'Assets', 'Others'], required: true },
    { name: 'keywords', label: 'Search Keywords', type: 'text', placeholder: 'e.g. vpn, network, login' },
    { name: 'content', label: 'Article Content', type: 'textarea' },
    { name: 'status', label: 'Status', type: 'select', options: ['Published', 'Draft', 'Archived'] }
  ];

  const getStatusColor = (status) => {
    if (status === 'Published') return { bg: '#ECFDF5', text: '#059669' };
    if (status === 'Archived') return { bg: '#F3F4F6', text: '#6B7280' };
    return { bg: '#FEF3C7', text: '#D97706' }; // Draft
  };

  const renderItem = ({ item }) => {
    const sColor = getStatusColor(item.status);
    const title = item.title || 'Untitled Article';
    const cat = item.cat || item.category || 'General';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{title.substring(0,2).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{item.date || item.created_at || ''}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sColor.bg }]}>
            <Text style={[styles.badgeText, { color: sColor.text }]}>{item.status || 'Published'}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category:</Text>
            <Text style={styles.infoValue}>{cat}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Views:</Text>
            <Text style={styles.infoValue}>{item.views || '0'}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionView(item)}>
            <Eye size={18} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionEdit(item)}>
            <Edit2 size={18} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionDelete(item)}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Knowledge Base</Text>
            <Text style={styles.headerSubtitle}>Manage knowledge base articles</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => { setActionSelectedItem(null); setActionModalMode('create'); setActionModalVisible(true); }}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" />
          <Text style={styles.searchPlaceholder}>Search articles...</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        />
      )}

      <ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
        fields={kbFields}
        title="KB Article"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerGradient: { padding: 20, paddingTop: 20, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, zIndex: 10 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2952E3', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchPlaceholder: { color: '#94A3B8', fontSize: 16, marginLeft: 10, fontWeight: '500' },
  listContent: { padding: 20, paddingTop: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardBody: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '600' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  actionBtn: { padding: 8, marginLeft: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }
});
