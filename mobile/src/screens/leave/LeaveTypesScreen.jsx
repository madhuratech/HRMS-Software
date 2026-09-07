import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Tag, ChevronLeft, Eye, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function LeaveTypesScreen({ navigation }) {

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/leaves/types/${item.id || item._id}`);
            if (typeof fetchData === 'function') fetchData();
            if (typeof loadData === 'function') loadData();
            if (typeof fetchDocuments === 'function') fetchDocuments();
            if (typeof fetchAppraisals === 'function') fetchAppraisals();
            if (typeof fetchProjects === 'function') fetchProjects();
          } catch (err) { console.error('Delete error:', err); }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      if (updatedItem.id || updatedItem._id) {
        await apiClient.put(`/leaves/types/${updatedItem.id || updatedItem._id}`, updatedItem);
      }
      setActionModalVisible(false);
      if (typeof fetchData === 'function') fetchData();
      if (typeof loadData === 'function') loadData();
      if (typeof fetchDocuments === 'function') fetchDocuments();
      if (typeof fetchAppraisals === 'function') fetchAppraisals();
      if (typeof fetchProjects === 'function') fetchProjects();
    } catch (err) { console.error('Update error:', err); }
  };

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/leaves/types');
      if (Array.isArray(res.data)) {
        setLeaveTypes(res.data);
      }
    } catch (err) {
      console.error('Error fetching leave types:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Tag size={20} color="#3B82F6" />
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.typeName}>{item.name}</Text>
          <Text style={styles.typeCode}>{item.code}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.descText}>{item.description}</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Max Days:</Text>
          <Text style={styles.statValue}>{item.max_days}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Carry Forward:</Text>
          <Text style={styles.statValue}>{item.carry_forward ? 'Yes' : 'No'}</Text>
        </View>
      </View>
    
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 12, gap: 12 }}>
        <TouchableOpacity style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }} onPress={() => handleActionView(item)}>
          <Eye size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }} onPress={() => handleActionEdit(item)}>
          <Edit2 size={18} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }} onPress={() => handleActionDelete(item)}>
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    
</View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Leave Types</Text>
            <Text style={styles.headerSubtitle}>View configured leave types</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={leaveTypes}
          keyExtractor={(item) => item.id?.toString() || item.code}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Tag size={48} color="#CBD5E1" />
              <Text style={styles.title}>No Leave Types</Text>
              <Text style={styles.subtitle}>No leave types configured.</Text>
            </View>
          }
        />
      )}
          <ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#F8FAFC' },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoCol: { flex: 1 },
  typeName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  typeCode: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '600' },
  cardBody: { padding: 16 },
  descText: { fontSize: 14, color: '#475569', marginBottom: 12, lineHeight: 20 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  statLabel: { fontSize: 13, color: '#6B7280' },
  statValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' }
});
