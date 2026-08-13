import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Search, Plus, MoreVertical, Users, Target, X, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function TeamsScreen() {
  const navigation = useNavigation();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/organization/teams');
      if (Array.isArray(res.data)) {
        setTeams(res.data);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      setSubmitting(true);
      await apiClient.post('/organization/teams', { name: newTeamName, description: newDescription });
      setNewTeamName('');
      setNewDescription('');
      setModalVisible(false);
      fetchTeams();
    } catch (err) {
      console.error('Error adding team:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = teams.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Teams</Text>
            <Text style={styles.headerSubtitle}>Manage working groups</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#4F46E5', '#4338CA']} style={styles.gradientBtn}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addButtonText}>Add Team</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search teams..." 
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
              <Text style={styles.emptyText}>No teams found</Text>
            </View>
          ) : (
            filtered.map((team, i) => (
              <View key={team.id || i} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.titleRow}>
                    <View style={[styles.colorIndicator, { backgroundColor: '#4F46E5' }]} />
                    <View>
                      <Text style={styles.teamName}>{team.name}</Text>
                      <Text style={styles.teamDesc} numberOfLines={2}>{team.description || 'No description provided'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Users size={16} color="#64748B" />
                      <Text style={styles.statText}>{team.members || 0} Members</Text>
                    </View>
                    {team.lead && (
                      <View style={styles.statBox}>
                        <Target size={16} color="#64748B" />
                        <Text style={styles.statText}>Lead: {team.lead}</Text>
                      </View>
                    )}
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
              <Text style={styles.modalTitle}>Add Team</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Team Name</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Alpha Squad"
                  placeholderTextColor="#94A3B8"
                  value={newTeamName}
                  onChangeText={setNewTeamName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput 
                  style={[styles.modalInput, { height: 80 }]}
                  placeholder="Team focus or goals..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  value={newDescription}
                  onChangeText={setNewDescription}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddTeam}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Adding...' : 'Add Team'}</Text>
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
    padding: 24,
    paddingTop: 48, 
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 20, overflow: 'hidden', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  toolbar: { padding: 24 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  content: { paddingHorizontal: 24 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 24, marginBottom: 20,
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', gap: 14, flex: 1 },
  colorIndicator: { width: 14, height: 14, borderRadius: 7, marginTop: 4 },
  teamName: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  teamDesc: { fontSize: 14, color: '#64748B', paddingRight: 20, lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  cardBody: {},
  statsRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  statText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  modalBody: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#4338CA', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
