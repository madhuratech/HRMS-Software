import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, Filter, Plus, X, Tag, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ExpenseCategoriesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER ADMIN';
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || isSuperAdmin;
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/expenses/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      } else if (Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching expense categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      await apiClient.post('/expenses/categories', { 
        name,
        description
      });
      setName('');
      setDescription('');
      setModalVisible(false);
      fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      Alert.alert('Error', 'Failed to add category.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = categories.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Expense Categories</Text>
            <Text style={styles.headerSubtitle}>Manage types of reimbursable expenses</Text>
          </View>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <LinearGradient colors={['#2563EB', '#2563EB']} style={styles.gradientBtn}>
              <Plus size={18} color='#FFFFFF' />
              <Text style={styles.addButtonText}>Add Category</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search categories..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          ) : (
            filtered.map((cat, i) => (
              <View key={cat.id || i} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.titleRow}>
                    <View style={styles.iconBox}>
                      <Tag size={20} color='#2563EB' />
                    </View>
                    <View>
                      <Text style={styles.catName}>{cat.name}</Text>
                      {cat.description ? (
                        <Text style={styles.catDesc}>{cat.description}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: cat.status === 'Active' ? '#ECFDF5' : '#FEF2F2' }]}>
                    <Text style={[styles.statusText, { color: cat.status === 'Active' ? '#059669' : '#DC2626' }]}>
                      {cat.status || 'Active'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category Name</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Travel"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Flight and train tickets"
                  placeholderTextColor="#94A3B8"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddCategory}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Adding...' : 'Add Category'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 20, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  toolbar: { flexDirection: 'row', padding: 24, gap: 12 },
  searchBox: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  content: { paddingHorizontal: 24 },
  card: { 
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#111827', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  catDesc: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  modalBody: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
