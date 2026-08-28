import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Search, FileText, X, Download, Trash2, CheckCircle, Circle, Briefcase, GraduationCap, ChevronLeft, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function EmployeeDocumentsScreen({ route }) {
  const navigation = useNavigation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [docType, setDocType] = useState('Contract');
  const [docName, setDocName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, FRESHER, EXPERIENCED

  // Fallback to empId = 1 if none provided (e.g. general view vs profile view)
  const empId = route?.params?.id || 1;

  useEffect(() => {
    fetchDocuments();
  }, [empId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/employees/${empId}/documents`);
      if (Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!docName.trim()) return;
    try {
      setSubmitting(true);
      // Mocking file upload via JSON body for simplicity. In reality this would be FormData
      await apiClient.post(`/employees/${empId}/documents`, { 
        docType, 
        fileName: docName,
        filePath: `/uploads/docs/${docName.replace(/\s+/g, '_').toLowerCase()}.pdf`
      });
      setDocName('');
      setDocType('Contract');
      setModalVisible(false);
      fetchDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await apiClient.delete(`/employees/documents/${docId}`);
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const filtered = documents.filter(d => 
    d.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.doc_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fresherChecklist = ['Offer Letter', '10th Marksheet', '12th Marksheet', 'Degree Certificate', 'Aadhaar Card', 'PAN Card'];
  const experiencedChecklist = ['Offer Letter', 'Relieving Letter', 'Experience Letter', 'Payslips', 'Degree Certificate', 'Aadhaar Card', 'PAN Card'];

  const checkIsUploaded = (reqDoc) => {
    return documents.some(d => d.doc_type?.toLowerCase().includes(reqDoc.toLowerCase()) || d.file_name?.toLowerCase().includes(reqDoc.toLowerCase()));
  };

  const renderChecklistItem = (item) => {
    const isUploaded = checkIsUploaded(item);
    return (
      <View key={item} style={styles.checklistItem}>
        <View style={styles.checklistItemLeft}>
          {isUploaded ? <CheckCircle size={20} color="#10B981" /> : <Circle size={20} color="#CBD5E1" />}
          <Text style={[styles.checklistText, isUploaded && styles.checklistTextDone]}>{item}</Text>
        </View>
        {!isUploaded && (
          <TouchableOpacity 
            style={styles.uploadMiniBtn} 
            onPress={() => {
              setDocType(item);
              setDocName(`${item.replace(/\s+/g, '_')}`);
              setModalVisible(true);
            }}
          >
            <Text style={styles.uploadMiniBtnText}>Upload</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <FileText size={24} color="#3B82F6" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.fileName}>{item.file_name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.docType}>{item.doc_type}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.uploadDate}>{new Date(item.uploaded_at).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Download size={20} color='#6B7280' />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.pageHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>Documents</Text>
            <Text style={styles.pageSubtitle}>Manage employee documents</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <LinearGradient colors={['#2563EB', '#3730A3']} style={styles.gradientBtn}>
              <Plus size={18} color='#FFFFFF' />
              <Text style={styles.addButtonText}>Upload</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'ALL' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>All Docs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'FRESHER' && styles.tabButtonActive]}
          onPress={() => setActiveTab('FRESHER')}
        >
          <GraduationCap size={16} color={activeTab === 'FRESHER' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'FRESHER' && styles.tabTextActive]}>Fresher Checklist</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'EXPERIENCED' && styles.tabButtonActive]}
          onPress={() => setActiveTab('EXPERIENCED')}
        >
          <Briefcase size={16} color={activeTab === 'EXPERIENCED' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'EXPERIENCED' && styles.tabTextActive]}>Exp. Checklist</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'ALL' && (
        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <Search size={20} color='#6B7280' />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search documents..." 
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color='#2563EB' />
        </View>
      ) : activeTab === 'ALL' ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No documents found.</Text>
            </View>
          }
        />
      ) : activeTab === 'FRESHER' ? (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>Required for Freshers</Text>
            {fresherChecklist.map(renderChecklistItem)}
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>Required for Experienced</Text>
            {experiencedChecklist.map(renderChecklistItem)}
          </View>
        </ScrollView>
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Document Type</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder="e.g. Contract, ID, Certificate"
                placeholderTextColor="#94A3B8"
                value={docType}
                onChangeText={setDocType}
              />
              <Text style={styles.inputLabel}>Document Name</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder="e.g. Employment_Contract_2026"
                placeholderTextColor="#94A3B8"
                value={docName}
                onChangeText={setDocName}
              />

              <View style={styles.uploadDropzone}>
                <FileText size={32} color="#94A3B8" style={{ marginBottom: 10 }} />
                <Text style={styles.dropzoneText}>Tap to select a file from device</Text>
                <Text style={styles.dropzoneSubText}>PDF, JPG, PNG (Max 5MB)</Text>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleUploadDocument}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Uploading...' : 'Upload Document'}</Text>
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
  pageHeader: { 
    paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTextContainer: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },

  addButton: { borderRadius: 16, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 6,
    marginTop: 24,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, gap: 6
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2
  },
  tabText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  tabTextActive: { color: '#2563EB' },

  toolbar: { padding: 24, paddingBottom: 16 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 24, paddingBottom: 24 },
  card: { 
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, alignItems: 'center', justifyContent: 'space-between'
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { marginLeft: 16, flex: 1 },
  fileName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  docType: { fontSize: 12, color: '#2563EB', fontWeight: '700', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  metaDot: { color: '#CBD5E1', marginHorizontal: 8 },
  uploadDate: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 10, backgroundColor: '#F8FAFC', borderRadius: 12 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },

  checklistCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 16, shadowColor: '#111827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3 },
  checklistTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  checklistItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checklistText: { fontSize: 15, color: '#1E293B', fontWeight: '600' },
  checklistTextDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  uploadMiniBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  uploadMiniBtnText: { color: '#2563EB', fontSize: 12, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  modalBody: { gap: 16 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  uploadDropzone: { borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 20, padding: 32, alignItems: 'center', backgroundColor: '#F8FAFC', marginVertical: 8 },
  dropzoneText: { fontSize: 15, fontWeight: '700', color: '#475569', marginBottom: 4 },
  dropzoneSubText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 16, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});
