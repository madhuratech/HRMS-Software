import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Check, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ActionModals({ visible, mode, item, schema, onClose, onSave, title }) {
  const [formData, setFormData] = useState({});
  const [showSelect, setShowSelect] = useState(null); // track which select is open

  useEffect(() => {
    if (mode === 'add' || mode === 'create') {
      const initial = {};
      if (schema) {
        schema.forEach(field => { initial[field.key] = field.defaultValue || ''; });
      }
      setFormData(initial);
    } else if (item) {
      setFormData(item);
    }
  }, [item, mode, schema, visible]);

  if (!visible) return null;

  const handleSave = () => {
    onSave(formData);
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const excludeKeys = ['id', '_id', 'created_at', 'updated_at', 'deleted_at', 'v'];

  const formatKey = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getModalTitle = () => {
    if (title) return title;
    return mode === 'view' ? 'View Details' : mode === 'edit' ? 'Edit Details' : 'Add New';
  };

  const renderViewContent = () => {
    if (schema) {
      return schema.map((field) => (
        <View key={field.key} style={styles.viewRow}>
          <Text style={styles.viewLabel}>{field.label || formatKey(field.key)}</Text>
          <Text style={styles.viewValue}>{formData[field.key] !== null && formData[field.key] !== undefined ? String(formData[field.key]) : '-'}</Text>
        </View>
      ));
    }

    return Object.entries(item || {}).map(([key, value]) => {
      if (excludeKeys.includes(key.toLowerCase())) return null;
      return (
        <View key={key} style={styles.viewRow}>
          <Text style={styles.viewLabel}>{formatKey(key)}</Text>
          <Text style={styles.viewValue}>{value !== null && value !== undefined ? String(value) : '-'}</Text>
        </View>
      );
    });
  };

  const renderEditContent = () => {
    if (schema) {
      return schema.map((field) => {
        if (field.type === 'select') {
          return (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{field.label || formatKey(field.key)}</Text>
              <TouchableOpacity 
                style={[styles.input, styles.selectInput, showSelect === field.key && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderColor: '#3B82F6' }]} 
                onPress={() => setShowSelect(showSelect === field.key ? null : field.key)}
              >
                <Text style={{ color: formData[field.key] !== undefined && formData[field.key] !== null && formData[field.key] !== '' ? '#0F172A' : '#94A3B8', fontSize: 15, fontWeight: '500' }}>
                  {
                    (field.options?.find(opt => typeof opt === 'object' && opt.value === formData[field.key])?.label) ||
                    (formData[field.key]) || 
                    `Select ${field.label || formatKey(field.key)}`
                  }
                </Text>
                <ChevronDown size={18} color={showSelect === field.key ? '#3B82F6' : '#64748B'} />
              </TouchableOpacity>
              {showSelect === field.key && (
                <ScrollView 
                  style={styles.dropdownMenu}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {field.options?.map((opt, idx) => {
                    const label = typeof opt === 'object' ? opt.label : opt;
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const isSelected = formData[field.key] === val;
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        style={[styles.dropdownItem, isSelected && { backgroundColor: '#EFF6FF' }]}
                        onPress={() => { handleChange(field.key, val); setShowSelect(null); }}
                      >
                        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                          {label}
                        </Text>
                        {isSelected && <Check size={16} color="#2563EB" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          );
        }

        return (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{field.label || formatKey(field.key)}</Text>
            <TextInput
              style={[styles.input, field.multiline && { height: 100, textAlignVertical: 'top' }]}
              value={formData[field.key] !== null && formData[field.key] !== undefined ? String(formData[field.key]) : ''}
              onChangeText={(text) => handleChange(field.key, text)}
              placeholder={field.placeholder || `Enter ${field.label || formatKey(field.key)}`}
              keyboardType={field.keyboardType || 'default'}
              multiline={field.multiline}
              secureTextEntry={field.secureTextEntry}
            />
          </View>
        );
      });
    }

    return Object.entries(formData).map(([key, value]) => {
      if (excludeKeys.includes(key.toLowerCase())) return null;
      return (
        <View key={key} style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{formatKey(key)}</Text>
          <TextInput
            style={styles.input}
            value={value !== null && value !== undefined ? String(value) : ''}
            onChangeText={(text) => handleChange(key, text)}
            placeholder={`Enter ${formatKey(key).toLowerCase()}`}
          />
        </View>
      );
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity activeOpacity={1} onPress={() => setShowSelect(null)}>
              {mode === 'view' ? renderViewContent() : renderEditContent()}
            </TouchableOpacity>
          </ScrollView>

          {(mode === 'edit' || mode === 'add' || mode === 'create') && (
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={{ flex: 1 }}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.saveBtn}>
                  <Check size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  scrollContent: {
    padding: 24,
  },
  viewRow: {
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownMenu: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 180,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
