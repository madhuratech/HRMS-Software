import React, { useState, useEffect, useCallback } from 'react';
import AppDropdown from '../ui/AppDropdown';
import {
  Search, Plus, Edit2, Trash2, Eye, MapPin, Check, X, ShieldAlert,
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import GeofenceMap from './GeofenceMap';

export default function PunchLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    latitude: 12.9716,
    longitude: 77.5946,
    radius: 100,
    address: '',
    description: '',
    status: 'Active'
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/attendance/punch-locations?search=${search}&status=${statusFilter}&page=${page}&limit=${limit}`);
      if (res.success) {
        setLocations(res.locations || []);
        setTotal(res.total || 0);
      } else {
        showToast(res.message || 'Failed to load locations', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend API', 'error');
    }
    setLoading(false);
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      branch: '',
      latitude: 12.9716,
      longitude: 77.5946,
      radius: 100,
      address: '',
      description: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const openEditModal = (loc) => {
    setModalMode('edit');
    setSelectedLocation(loc);
    setFormData({
      name: loc.name,
      branch: loc.branch || '',
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      radius: parseInt(loc.radius),
      address: loc.address || '',
      description: loc.description || '',
      status: loc.status
    });
    setShowModal(true);
  };

  const openViewModal = (loc) => {
    setModalMode('view');
    setSelectedLocation(loc);
    setFormData({
      name: loc.name,
      branch: loc.branch || '',
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      radius: parseInt(loc.radius),
      address: loc.address || '',
      description: loc.description || '',
      status: loc.status
    });
    setShowModal(true);
  };

  const handleMapChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6))
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.radius) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      let res;
      if (modalMode === 'add') {
        res = await apiFetch('/attendance/punch-locations', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      } else {
        res = await apiFetch(`/attendance/punch-locations/${selectedLocation.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      }

      if (res.success) {
        showToast(
          modalMode === 'add'
            ? 'Punch location added successfully'
            : 'Punch location updated successfully'
        );
        setShowModal(false);
        loadLocations();
      } else {
        showToast(res.message || 'Failed to save location', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error communicating with server', 'error');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this punch location? This cannot be undone.')) {
      return;
    }

    try {
      const res = await apiFetch(`/attendance/punch-locations/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        showToast('Punch location deleted successfully');
        loadLocations();
      } else {
        showToast(res.message || 'Failed to delete location', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error communicating with server', 'error');
    }
  };

  const handleToggleStatus = async (loc) => {
    const newStatus = loc.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await apiFetch(`/attendance/punch-locations/${loc.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.success) {
        showToast(`Location status updated to ${newStatus}`);
        loadLocations();
      } else {
        showToast(res.message || 'Failed to toggle status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error communicating with server', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: toast.type === 'error' ? '#EF4444' : '#10B981',
          color: '#FFF', padding: '12px 24px', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header and Action toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Punch Locations (Geofencing)</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Configure office geofences to validate employee punches</p>
        </div>

        <button
          onClick={openAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={16} /> Add Location
        </button>
      </div>

      {/* Filters Card */}
      <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E5E7EB', padding: '16px 20px', display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search by name, branch, or address..."
            value={search}
            onChange={handleSearchChange}
            style={{ width: '100%', height: 38, padding: '0 12px 0 38px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }}
          />
        </div>

        <div style={{ width: 160 }}>
          <AppDropdown value={statusFilter} onChange={handleStatusFilterChange} options={[{value:'',label:'All Status'},{value:'Active',label:'Active'},{value:'Inactive',label:'Inactive'}]} size="sm" />
        </div>
      </div>

      {/* Locations Table */}
      <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#374151' }}>Location Name</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#374151' }}>Branch</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#374151' }}>Coordinates</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#374151' }}>Radius</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#374151' }}>Address</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#374151' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#374151', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>Loading locations...</td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>No office punch locations found.</td>
                </tr>
              ) : (
                locations.map(loc => (
                  <tr key={loc.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{loc.name}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#4B5563' }}>{loc.branch || 'N/A'}</td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#4B5563', fontFamily: 'monospace' }}>
                      {parseFloat(loc.latitude).toFixed(5)}, {parseFloat(loc.longitude).toFixed(5)}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#4B5563' }}>
                      <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>
                        {loc.radius}m
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#4B5563', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {loc.address || '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        onClick={() => handleToggleStatus(loc)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                          borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                          background: loc.status === 'Active' ? '#ECFDF5' : '#FEF2F2',
                          color: loc.status === 'Active' ? '#059669' : '#DC2626'
                        }}
                      >
                        {loc.status === 'Active' ? <Check size={12} /> : <X size={12} />}
                        {loc.status}
                      </button>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => openViewModal(loc)}
                          title="View location map"
                          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => openEditModal(loc)}
                          title="Edit details"
                          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          title="Delete Location"
                          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              Showing Page {page} of {totalPages} ({total} locations)
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: '1px solid #E5E7EB', borderRadius: 6, background: '#FFF', color: page === 1 ? '#C7D2FE' : '#4B5563', cursor: page === 1 ? 'default' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: '1px solid #E5E7EB', borderRadius: 6, background: '#FFF', color: page === totalPages ? '#C7D2FE' : '#4B5563', cursor: page === totalPages ? 'default' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Add / Edit / View Geofence */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', width: '90%', maxWidth: 900, height: '90%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                {modalMode === 'add' && 'Create Geofence Location'}
                {modalMode === 'edit' && 'Edit Geofence Location'}
                {modalMode === 'view' && `View ${formData.name}`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '360px 1fr', overflow: 'hidden' }}>
              
              {/* Form Side */}
              <form onSubmit={handleFormSubmit} style={{ padding: 24, borderRight: '1px solid #E5E7EB', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>Location Name *</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    placeholder="e.g. Headquarters"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ width: '100%', height: 38, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>Branch / Division</label>
                  <input
                    type="text"
                    disabled={modalMode === 'view'}
                    placeholder="e.g. Bangalore Corporate"
                    value={formData.branch}
                    onChange={e => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                    style={{ width: '100%', height: 38, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.latitude}
                      onChange={e => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                      style={{ width: '100%', height: 38, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.longitude}
                      onChange={e => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                      style={{ width: '100%', height: 38, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>Allowed Radius (Meters) *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="25"
                      disabled={modalMode === 'view'}
                      value={formData.radius}
                      onChange={e => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: 6, minWidth: 50, textAlign: 'center' }}>
                      {formData.radius}m
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>Address</label>
                  <textarea
                    disabled={modalMode === 'view'}
                    placeholder="Physical address of the office..."
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    style={{ width: '100%', minHeight: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>Description</label>
                  <textarea
                    disabled={modalMode === 'view'}
                    placeholder="Short description/notes..."
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    style={{ width: '100%', minHeight: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none' }}
                  />
                </div>

                {modalMode !== 'view' && (
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{ flex: 1, height: 38, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#FFF', color: '#374151', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ flex: 1, height: 38, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#2952E3', color: '#FFF', cursor: 'pointer' }}
                    >
                      Save Location
                    </button>
                  </div>
                )}
              </form>

              {/* Map Side */}
              <div style={{ padding: 16, background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} style={{ color: '#2563EB' }} />
                  {modalMode === 'view' ? 'Geofence representation on map' : 'Click on map or drag marker to capture Latitude & Longitude'}
                </div>
                <div style={{ flex: 1, background: '#FFF', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <GeofenceMap
                    lat={formData.latitude}
                    lng={formData.longitude}
                    radius={formData.radius}
                    onChange={handleMapChange}
                    readonly={modalMode === 'view'}
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
