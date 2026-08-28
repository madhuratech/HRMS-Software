import React, { useState, useEffect } from 'react';
import { Search, Upload, Download, Trash2, FileText, Plus, Eye, User } from 'lucide-react';
import { useToast } from '../ui/Toast';
import './employee-module.css';

export default function EmployeeDocuments() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  
  // New Doc Form
  const [docType, setDocType] = useState('PAN');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [currentEmpId, setCurrentEmpId] = useState(() => localStorage.getItem('selectedEmployeeId') || '1');

  const handleEmployeeSelect = (newId) => {
    localStorage.setItem('selectedEmployeeId', newId);
    setCurrentEmpId(newId);
  };

  useEffect(() => {
    fetch('/app/employees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllEmployees(data);
      })
      .catch(err => console.error("Error fetching all employees:", err));
  }, []);

  const loadDocuments = () => {
    setLoading(true);
    fetch(`/app/employees/${currentEmpId}/documents`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          setDocuments([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDocuments();
  }, [currentEmpId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast("Please select a file to upload", "error");
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('docType', docType);

    fetch(`/app/employees/${currentEmpId}/documents`, {
      method: "POST",
      body: formData
    })
    .then(async res => {
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Upload failed");
      }
      return res.json();
    })
    .then(() => {
      addToast("Document uploaded successfully!", "success");
      setFileName('');
      setSelectedFile(null);
      setShowAddForm(false);
      loadDocuments();
    })
    .catch(err => {
      console.error(err);
      addToast(err.message || "Failed to upload document file", "error");
    });
  };

  const handleDelete = (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    fetch(`/app/employees/documents/${docId}`, {
      method: "DELETE"
    })
    .then(res => {
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    })
    .then(() => {
      addToast("Document deleted successfully", "success");
      loadDocuments();
    })
    .catch(err => {
      console.error(err);
      addToast("Failed to delete document", "error");
    });
  };

  const filteredDocs = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.doc_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="hrms-content">
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Employee Documents</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px',
            padding: '6px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <User size={16} color="#475569" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Select Employee:</span>
            <select
              value={currentEmpId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0F172A',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {allEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeCode || `EMP00${emp.id}`}) {emp.status === 'Terminated' ? '• Terminated' : ''}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="hrms-primary-btn" 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={16} /> Register Document
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleUpload} className="hrms-card hrms-mb-6" style={{ maxWidth: '600px' }}>
          <h3 className="hrms-font-semibold hrms-mb-4">Register/Upload Employee Document</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="hrms-input-group">
              <label className="hrms-label">Document Type *</label>
              <select className="hrms-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="PAN">PAN Card</option>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Appointment Letter">Appointment Letter</option>
                <option value="Payslip">Salary Slip</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="hrms-input-group" style={{ gridColumn: 'span 2' }}>
              <label className="hrms-label">Select File *</label>
              <input type="file" className="hrms-input" onChange={handleFileChange} style={{ padding: '8px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="hrms-secondary-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" className="hrms-primary-btn">Save Document</button>
          </div>
        </form>
      )}

      <div className="hrms-grid-4 hrms-mb-6">
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Total Documents</span>
          <span className="hrms-stat-value hrms-text-primary">{documents.length}</span>
          <span className="hrms-stat-trend hrms-text-muted">For Selected Employee</span>
        </div>
      </div>

      <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="hrms-flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div className="hrms-flex-start" style={{ gap: '16px' }}>
            <div className="hrms-search-input" style={{ width: '250px' }}>
              <Search className="hrms-search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search Document..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="hrms-table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Document Name</th>
                <th>Uploaded Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '16px' }}>Loading documents...</td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '16px' }}>No documents registered.</td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{doc.doc_type}</td>
                    <td>
                      <div className="hrms-flex-start" style={{ gap: '8px' }}>
                        <FileText size={16} className="hrms-text-muted" />
                        <span style={{ whiteSpace: 'nowrap' }}>{doc.file_name}</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {(() => {
                          const fileUrl = doc.file_path.startsWith('http') ? doc.file_path : (doc.file_path.startsWith('/') ? doc.file_path : `/${doc.file_path}`);
                          return (
                            <>
                              <a href={fileUrl} target="_blank" rel="noreferrer" title="View" style={{cursor: 'pointer', color: '#64748b'}}>
                                <Eye size={16} />
                              </a>
                              <a href={fileUrl} target="_blank" rel="noreferrer" download title="Download" style={{cursor: 'pointer', color: '#64748b'}}>
                                <Download size={16} />
                              </a>
                            </>
                          );
                        })()}
                        <button title="Delete" onClick={() => handleDelete(doc.id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444'}}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
