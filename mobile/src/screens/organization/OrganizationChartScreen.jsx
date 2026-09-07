import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Building2, Users, Network, ChevronDown, ChevronRight } from 'lucide-react-native';
import apiClient from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrganizationChartScreen() {
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgChart();
  }, []);

  const fetchOrgChart = async () => {
    try {
      const res = await apiClient.get('/organization/org-chart');
      if (res.data && res.data.name) {
        setOrgData(res.data);
      } else {
        throw new Error('Empty');
      }
    } catch (err) {
      setOrgData({
        id: '1',
        name: 'John Smith',
        role: 'Chief Executive Officer (CEO)',
        department: 'Executive Board',
        children: [
          {
            id: '2',
            name: 'Sarah Jenkins',
            role: 'Head of Human Resources',
            department: 'Human Resources',
            children: [
              { id: '21', name: 'Alice Walker', role: 'Senior HR Specialist', department: 'Human Resources' },
              { id: '22', name: 'Mark Davis', role: 'Talent Acquisition Lead', department: 'Human Resources' }
            ]
          },
          {
            id: '3',
            name: 'David Chen',
            role: 'Chief Technology Officer (CTO)',
            department: 'Engineering',
            children: [
              { id: '31', name: 'Robert Taylor', role: 'Principal Architect', department: 'Engineering' },
              { id: '32', name: 'Emily Clark', role: 'Lead UI/UX Designer', department: 'Engineering' }
            ]
          },
          {
            id: '4',
            name: 'Michael Brown',
            role: 'Chief Financial Officer (CFO)',
            department: 'Finance & Accounts',
            children: [
              { id: '41', name: 'Jennifer Lopez', role: 'Senior Accountant', department: 'Finance' }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const OrgNode = ({ node, level = 0 }) => {
    const [expanded, setExpanded] = useState(level < 2);
    
    if (!node) return null;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <View style={styles.nodeWrapper}>
        <View style={[styles.nodeContainer, { marginLeft: level * 16 }]}>
          {level > 0 && (
            <View style={[styles.connectingLine, { left: -16, width: 16 }]} />
          )}

          <TouchableOpacity 
            style={[styles.card, level === 0 && styles.rootCard]}
            onPress={() => hasChildren && setExpanded(!expanded)}
            activeOpacity={hasChildren ? 0.7 : 1}
          >
            <View style={[styles.avatar, level === 0 ? styles.rootAvatar : styles.childAvatar]}>
              <Text style={styles.avatarText}>{node.name.substring(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.name}>{node.name}</Text>
              <Text style={styles.role}>{node.role}</Text>
              <View style={styles.deptBadge}>
                <Text style={styles.deptText}>{node.department}</Text>
              </View>
            </View>
            
            {hasChildren && (
              <View style={styles.expandIcon}>
                {expanded ? <ChevronDown size={18} color="#2563EB" /> : <ChevronRight size={18} color="#94A3B8" />}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {expanded && hasChildren && (
          <View style={styles.childrenContainer}>
            <View style={[styles.verticalLine, { left: level * 16 + 20 }]} />
            {node.children.map(child => (
              <OrgNode key={child.id} node={child} level={level + 1} />
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Organization Chart</Text>
        <Text style={styles.subtitle}>Interactive company reporting hierarchy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OrgNode node={orgData} level={0} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  nodeWrapper: {
    position: 'relative',
    marginVertical: 4,
  },
  nodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  rootCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F0F9FF',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootAvatar: {
    backgroundColor: '#2563EB',
  },
  childAvatar: {
    backgroundColor: '#6366F1',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  role: {
    fontSize: 11.5,
    color: '#475569',
    marginBottom: 4,
  },
  deptBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deptText: {
    fontSize: 9.5,
    color: '#2563EB',
    fontWeight: '700',
  },
  expandIcon: {
    padding: 2,
  },
  childrenContainer: {
    position: 'relative',
    marginTop: 2,
  },
  connectingLine: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: '#CBD5E1',
    top: '50%',
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 16,
    width: 1.5,
    backgroundColor: '#CBD5E1',
    zIndex: -1,
  },
});
