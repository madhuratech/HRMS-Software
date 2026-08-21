import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Network, User, Briefcase, Calendar, ChevronDown, ChevronRight, Users, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

const ROLE_ORDER = ['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
const ROLE_CONFIG = {
  SUPER_ADMIN: { label: 'Super Admin', color: '#4F46E5', bg: '#EEF2FF', border: '#4F46E5', borderWidth: 2 },
  ADMIN:       { label: 'Admin',       color: '#0EA5E9', bg: '#E0F2FE', border: '#0EA5E9', borderWidth: 2 },
  HR:          { label: 'HR',          color: '#10B981', bg: '#D1FAE5', border: '#10B981', borderWidth: 1.5 },
  MANAGER:     { label: 'Manager',     color: '#F59E0B', bg: '#FEF3C7', border: '#F59E0B', borderWidth: 1.5 },
  EMPLOYEE:    { label: 'Employee',    color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1', borderWidth: 1 },
};

function getRoleKey(emp) {
  const r = (emp.role || emp.role_name || '').toUpperCase().replace(/\s+/g, '_');
  if (r.includes('SUPER')) return 'SUPER_ADMIN';
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'HR') return 'HR';
  if (r === 'MANAGER') return 'MANAGER';
  return 'EMPLOYEE';
}

function getInitials(emp) {
  const first = emp.first_name || emp.name || '';
  const last = emp.last_name || '';
  return ((first[0] || '') + (last[0] || '')).toUpperCase() || '?';
}

function EmployeeCard({ emp, isLast }) {
  const roleKey = getRoleKey(emp);
  const cfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG.EMPLOYEE;
  const name = emp.first_name ? `${emp.first_name} ${emp.last_name || ''}` : (emp.name || 'Unknown');
  const designation = emp.designation || emp.position || cfg.label;
  const dept = emp.department || emp.dept_name || emp.department_name || '';
  const joining = emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <View style={styles.cardWrapper}>
      <View style={[styles.empCard, { borderColor: cfg.border, borderWidth: cfg.borderWidth }]}>
        <View style={[styles.avatarBox, { backgroundColor: cfg.color }]}>
          <Text style={styles.avatarText}>{getInitials(emp)}</Text>
        </View>
        <View style={styles.empInfo}>
          <Text style={styles.empName} numberOfLines={1}>{name}</Text>
          <Text style={styles.empDesig} numberOfLines={1}>{designation}</Text>
          {dept ? <Text style={styles.empDept} numberOfLines={1}>{dept}</Text> : null}
          <View style={styles.bottomRow}>
            <View style={[styles.roleBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.roleText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <Text style={styles.joinDate}>{joining}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function RoleGroup({ roleKey, employees, expanded, onToggle }) {
  const cfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG.EMPLOYEE;
  if (!employees || employees.length === 0) return null;
  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity style={[styles.groupHeader, { borderLeftColor: cfg.color }]} onPress={onToggle} activeOpacity={0.8}>
        <View style={[styles.groupIconBox, { backgroundColor: cfg.bg }]}>
          <Users size={18} color={cfg.color} />
        </View>
        <Text style={[styles.groupTitle, { color: cfg.color }]}>{cfg.label}s</Text>
        <View style={[styles.groupCount, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.groupCountText, { color: cfg.color }]}>{employees.length}</Text>
        </View>
        <View style={{ flex: 1 }} />
        {expanded
          ? <ChevronDown size={18} color={cfg.color} />
          : <ChevronRight size={18} color={cfg.color} />
        }
      </TouchableOpacity>

      {expanded && (
        <View style={styles.groupContent}>
          {/* Tree connector lines */}
          {employees.map((emp, idx) => (
            <View key={emp.id || idx} style={styles.treeRow}>
              <View style={styles.treeLines}>
                <View style={[styles.treeLine, { borderColor: cfg.border }]} />
                {idx < employees.length - 1 && <View style={[styles.treeLineV, { borderColor: cfg.border }]} />}
              </View>
              <View style={{ flex: 1 }}>
                <EmployeeCard emp={emp} isLast={idx === employees.length - 1} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function OrganizationChartScreen() {
  const navigation = useNavigation();
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState({ SUPER_ADMIN: true, ADMIN: true, HR: true, MANAGER: true, EMPLOYEE: true });
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/employees');
      if (Array.isArray(res.data)) {
        const g = {};
        ROLE_ORDER.forEach(r => { g[r] = []; });
        res.data.forEach(emp => {
          const rk = getRoleKey(emp);
          if (!g[rk]) g[rk] = [];
          g[rk].push(emp);
        });
        // Sort each group by designation then name
        Object.keys(g).forEach(rk => {
          g[rk].sort((a, b) => {
            const da = a.designation || a.position || '';
            const db = b.designation || b.position || '';
            if (da !== db) return da.localeCompare(db);
            const na = (a.first_name || a.name || '');
            const nb = (b.first_name || b.name || '');
            return na.localeCompare(nb);
          });
        });
        setGrouped(g);
        setTotal(res.data.length);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchEmployees(); };
  const toggleGroup = (rk) => setExpanded(prev => ({ ...prev, [rk]: !prev[rk] }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Organization Chart</Text>
            <Text style={styles.headerSubtitle}>View company structure</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{total}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        {ROLE_ORDER.filter(r => grouped[r]?.length > 0).map(rk => (
          <View key={rk} style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: ROLE_CONFIG[rk]?.color }]}>{grouped[rk]?.length || 0}</Text>
            <Text style={styles.summaryLabel}>{ROLE_CONFIG[rk]?.label}s</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading organization chart...</Text>
        </View>
      ) : total === 0 ? (
        <View style={styles.emptyBox}>
          <Network size={56} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Employees Found</Text>
          <Text style={styles.emptyText}>Add employees to see the organization chart.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
          showsVerticalScrollIndicator={false}
        >
          {ROLE_ORDER.map(rk => (
            <RoleGroup
              key={rk}
              roleKey={rk}
              employees={grouped[rk] || []}
              expanded={expanded[rk]}
              onToggle={() => toggleGroup(rk)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 24, 
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },

  summaryBar: {
    flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    gap: 8, flexWrap: 'wrap'
  },
  summaryItem: { alignItems: 'center', minWidth: 54 },
  summaryNum: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  summaryLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  groupContainer: { marginBottom: 16 },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 16, padding: 16, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    gap: 10
  },
  groupIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { fontSize: 16, fontWeight: '800' },
  groupCount: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  groupCountText: { fontSize: 13, fontWeight: '800' },
  groupContent: { marginTop: 8, marginLeft: 16 },

  treeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  treeLines: { width: 20, alignItems: 'center' },
  treeLine: { width: 16, borderBottomWidth: 1.5, borderStyle: 'dashed', marginTop: 28 },
  treeLineV: { position: 'absolute', top: 0, bottom: -4, left: 0, borderLeftWidth: 1.5, borderStyle: 'dashed' },

  cardWrapper: { flex: 1, marginBottom: 8 },
  empCard: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    alignItems: 'center',
  },
  avatarBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  empInfo: { flex: 1 },
  empName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  empDesig: { fontSize: 13, color: '#475569', fontWeight: '600', marginBottom: 2 },
  empDept: { fontSize: 12, color: '#94A3B8', fontWeight: '500', marginBottom: 6 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 11, fontWeight: '700' },
  joinDate: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
});
