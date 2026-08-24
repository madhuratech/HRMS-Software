import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Save, Trash2, Lock, Users, RefreshCw, Layers, ShieldCheck, UserCheck, Users2, User } from 'lucide-react';
import { useToast } from '../ui/Toast';

export function UserRoles() {
  const { addToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionsMatrix, setPermissionsMatrix] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Role Form
  const [newRoleData, setNewRoleData] = useState({
    role_name: '',
    description: '',
    template_role: 'EMPLOYEE'
  });
  const [creating, setCreating] = useState(false);

  const getAuthToken = () => {
    const auth = localStorage.getItem('hrms_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        return parsed.token || 'mock_jwt_token';
      } catch (e) {
        return 'mock_jwt_token';
      }
    }
    return 'mock_jwt_token';
  };

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await fetch('/app/rbac/roles', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRoles(data.data);
        if (!selectedRole && data.data.length > 0) {
          setSelectedRole(data.data[0]);
        }
      } else {
        addToast(data.message || 'Failed to fetch roles', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setLoadingRoles(false);
    }
  }, [selectedRole, addToast]);

  const fetchRolePermissions = useCallback(async (roleKey) => {
    setLoadingMatrix(true);
    try {
      const res = await fetch(`/app/rbac/permissions/${roleKey}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPermissionsMatrix(data.data);
      } else {
        addToast(data.message || 'Failed to fetch permissions', 'error');
      }
    } catch (err) {
      addToast('Error loading permission matrix', 'error');
    } finally {
      setLoadingMatrix(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole && selectedRole.role_key) {
      fetchRolePermissions(selectedRole.role_key);
    }
  }, [selectedRole, fetchRolePermissions]);

  const handleCheckboxChange = (moduleKey, field) => {
    if (selectedRole?.role_key === 'SUPER_ADMIN' || selectedRole?.role_key === 'ADMIN') {
      addToast('Admin permissions are protected and cannot be disabled', 'info');
      return;
    }
    setPermissionsMatrix(prev =>
      prev.map(item => {
        if (item.module_key === moduleKey) {
          const updated = { ...item, [field]: !item[field] };
          // If view is unselected, unselect create/edit/delete as well
          if (field === 'can_view' && !updated.can_view) {
            updated.can_create = false;
            updated.can_edit = false;
            updated.can_delete = false;
          }
          // If create/edit/delete is selected, automatically enable view
          if ((field === 'can_create' || field === 'can_edit' || field === 'can_delete') && updated[field]) {
            updated.can_view = true;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRowToggle = (moduleKey) => {
    if (selectedRole?.role_key === 'SUPER_ADMIN' || selectedRole?.role_key === 'ADMIN') return;
    setPermissionsMatrix(prev =>
      prev.map(item => {
        if (item.module_key === moduleKey) {
          const allActive = item.can_view && item.can_create && item.can_edit && item.can_delete;
          return {
            ...item,
            can_view: !allActive,
            can_create: !allActive,
            can_edit: !allActive,
            can_delete: !allActive
          };
        }
        return item;
      })
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await fetch(`/app/rbac/permissions/${selectedRole.role_key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          permissions: permissionsMatrix,
          roleInfo: {
            role_name: selectedRole.role_name,
            description: selectedRole.description
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Permission matrix updated for ${selectedRole.role_name}!`, 'success');
        window.dispatchEvent(new Event('permissionsUpdated'));
      } else {
        addToast(data.message || 'Failed to save permissions', 'error');
      }
    } catch (err) {
      addToast('Error saving permission matrix', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleData.role_name.trim()) {
      addToast('Please enter a role name', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/app/rbac/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(newRoleData)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`New role "${newRoleData.role_name}" created successfully!`, 'success');
        setShowAddModal(false);
        setNewRoleData({ role_name: '', description: '', template_role: 'EMPLOYEE' });
        await fetchRoles();
      } else {
        addToast(data.message || 'Failed to create role', 'error');
      }
    } catch (err) {
      addToast('Error creating role', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (roleKey, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the custom role "${roleName}"?`)) return;
    try {
      const res = await fetch(`/app/rbac/roles/${roleKey}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Role "${roleName}" deleted successfully`, 'success');
        setSelectedRole(null);
        await fetchRoles();
      } else {
        addToast(data.message || 'Failed to delete role', 'error');
      }
    } catch (err) {
      addToast('Error deleting role', 'error');
    }
  };

  const getRoleIcon = (roleKey) => {
    const key = (roleKey || '').toUpperCase();
    if (key === 'SUPER_ADMIN' || key === 'ADMIN') return <ShieldCheck size={20} className="text-blue-600" />;
    if (key === 'HR_MANAGER' || key === 'HR') return <UserCheck size={20} className="text-indigo-600" />;
    if (key === 'TEAM_LEADER') return <Users2 size={20} className="text-cyan-600" />;
    return <User size={20} className="text-slate-600" />;
  };

  const standardRoles = roles.filter(r => r.is_system);
  const customRoles = roles.filter(r => !r.is_system);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <Shield size={22} />
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0F172A' }}>User Roles & Access Control</h1>
          </div>
          <p style={{ margin: '4px 0 0 46px', fontSize: 14, color: '#64748B' }}>
            Configure user roles and manage fine-grained permission matrices across all HRMS modules.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', background: '#2563EB', color: '#FFFFFF',
            borderRadius: 10, fontWeight: 600, fontSize: 14, border: 'none',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
          }}
        >
          <Plus size={18} />
          Create Custom Role
        </button>
      </div>

      {/* Standard System Roles Section */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={18} color="#2563EB" /> Standard System Roles
        </h3>

        {loadingRoles ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#64748B', background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            Loading standard system roles...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
            {standardRoles.map(r => {
              const isSelected = selectedRole?.role_key === r.role_key;
              return (
                <div
                  key={r.id || r.role_key}
                  onClick={() => setSelectedRole(r)}
                  style={{
                    background: isSelected ? '#F0F6FF' : '#FFFFFF',
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(37,99,235,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {getRoleIcon(r.role_key)}
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                        background: '#F1F5F9', color: '#475569', textTransform: 'uppercase'
                      }}>
                        System Default
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={13} /> {r.user_count || 0}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: isSelected ? '#1E40AF' : '#0F172A' }}>
                    {r.role_name}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748B', lineHeight: 1.4, height: 34, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {r.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Roles Section (if any created) */}
      {customRoles.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="#D97706" /> Custom Roles
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
            {customRoles.map(r => {
              const isSelected = selectedRole?.role_key === r.role_key;
              return (
                <div
                  key={r.id || r.role_key}
                  onClick={() => setSelectedRole(r)}
                  style={{
                    background: isSelected ? '#FEF3C7' : '#FFFFFF',
                    border: isSelected ? '2px solid #D97706' : '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(217,119,6,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                      background: '#FEF3C7', color: '#D97706', textTransform: 'uppercase'
                    }}>
                      Custom Role
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={13} /> {r.user_count || 0}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: isSelected ? '#92400E' : '#0F172A' }}>
                    {r.role_name}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748B', lineHeight: 1.4, height: 34, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {r.description}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(r.role_key, r.role_name);
                    }}
                    style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'none', border: 'none', color: '#94A3B8',
                      cursor: 'pointer', padding: 4
                    }}
                    title="Delete Custom Role"
                  >
                    <Trash2 size={15} className="hover:text-red-600 transition-colors" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Permission Matrix */}
      {selectedRole && (
        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {/* Matrix Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAFA' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                  Permission Matrix: <span style={{ color: '#2563EB' }}>{selectedRole.role_name}</span>
                </h2>
                {(selectedRole.role_key === 'SUPER_ADMIN' || selectedRole.role_key === 'ADMIN') && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ECFDF5', color: '#059669', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    <Lock size={12} /> Protected Full Access
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748B' }}>
                Toggle module-level permissions for View, Create, Edit, and Delete actions.
              </p>
            </div>

            <button
              onClick={handleSavePermissions}
              disabled={saving || selectedRole.role_key === 'SUPER_ADMIN' || selectedRole.role_key === 'ADMIN'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', background: (selectedRole.role_key === 'SUPER_ADMIN' || selectedRole.role_key === 'ADMIN') ? '#94A3B8' : '#10B981',
                color: '#FFFFFF', borderRadius: 10, fontWeight: 600, fontSize: 14,
                border: 'none', cursor: (selectedRole.role_key === 'SUPER_ADMIN' || selectedRole.role_key === 'ADMIN') || saving ? 'not-allowed' : 'pointer',
                boxShadow: (selectedRole.role_key === 'SUPER_ADMIN' || selectedRole.role_key === 'ADMIN') ? 'none' : '0 2px 8px rgba(16,185,129,0.25)'
              }}
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>

          {/* Matrix Table */}
          {loadingMatrix ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              Loading permission matrix...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#475569', width: '35%' }}>
                      MODULE NAME
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#475569', width: '15%' }}>
                      CAN VIEW
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#475569', width: '15%' }}>
                      CAN CREATE
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#475569', width: '15%' }}>
                      CAN EDIT
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#475569', width: '15%' }}>
                      CAN DELETE
                    </th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#475569', width: '10%' }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissionsMatrix.map((item, idx) => {
                    const allSelected = item.can_view && item.can_create && item.can_edit && item.can_delete;
                    const isProtectedAdmin = selectedRole.role_key === 'SUPER_ADMIN' || selectedRole.role_key === 'ADMIN';
                    return (
                      <tr key={item.module_key} style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{item.module_label}</div>
                          <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.category} Module</div>
                        </td>

                        {['can_view', 'can_create', 'can_edit', 'can_delete'].map(field => (
                          <td key={field} style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={item[field]}
                              disabled={isProtectedAdmin}
                              onChange={() => handleCheckboxChange(item.module_key, field)}
                              style={{
                                width: 18, height: 18, accentColor: '#2563EB', cursor: isProtectedAdmin ? 'not-allowed' : 'pointer'
                              }}
                            />
                          </td>
                        ))}

                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRowToggle(item.module_key)}
                            disabled={isProtectedAdmin}
                            style={{
                              padding: '4px 10px', fontSize: 11, fontWeight: 600,
                              background: allSelected ? '#F1F5F9' : '#EFF6FF',
                              color: allSelected ? '#475569' : '#2563EB',
                              border: 'none', borderRadius: 6, cursor: isProtectedAdmin ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Role Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 500,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Create Custom Role</h3>
            <form onSubmit={handleCreateRoleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Role Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finance Manager"
                  value={newRoleData.role_name}
                  onChange={(e) => setNewRoleData(prev => ({ ...prev, role_name: e.target.value }))}
                  required
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  placeholder="Briefly describe the purpose of this custom role..."
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Copy Initial Permissions From
                </label>
                <select
                  value={newRoleData.template_role}
                  onChange={(e) => setNewRoleData(prev => ({ ...prev, template_role: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', background: '#FFFFFF'
                  }}
                >
                  <option value="EMPLOYEE">Employee (Self-Service)</option>
                  <option value="HR_MANAGER">HR (Human Resources Management)</option>
                  <option value="TEAM_LEADER">Team Leader (Team Management)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', background: '#F1F5F9', color: '#475569', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ padding: '10px 20px', background: '#2563EB', color: '#FFFFFF', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  {creating ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
