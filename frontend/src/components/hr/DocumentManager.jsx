import React, { useState } from 'react';
import { FileText, Upload, Search, Download, Trash2, FileCheck, Shield, User, FileBadge } from 'lucide-react';













const MOCK_DOCUMENTS = [
{ id: 1, name: 'Offer_Letter_JohnDoe.pdf', type: 'OFFER_LETTER', employeeName: 'John Doe', employeeId: 'EMP001', uploadDate: '2025-01-15', size: '2.4 MB', status: 'VERIFIED' },
{ id: 2, name: 'KYC_Aadhar_AliceSmith.pdf', type: 'KYC', employeeName: 'Alice Smith', employeeId: 'EMP002', uploadDate: '2026-01-20', size: '1.1 MB', status: 'VERIFIED' },
{ id: 3, name: 'Payslip_Jan2026_BobJohnson.pdf', type: 'PAYSLIP', employeeName: 'Bob Johnson', employeeId: 'EMP003', uploadDate: '2026-02-01', size: '0.8 MB', status: 'PENDING' },
{ id: 4, name: 'ID_Card_Front_SarahWilliams.jpg', type: 'ID_CARD', employeeName: 'Sarah Williams', employeeId: 'EMP004', uploadDate: '2026-01-10', size: '3.5 MB', status: 'VERIFIED' }];


const DOC_TYPES = [
{ id: 'WAGES', label: 'Wages Sheet', icon: FileText },
{ id: 'PAYSLIP', label: 'Payslip', icon: FileBadge },
{ id: 'OFFER_LETTER', label: 'Offer Letter', icon: FileCheck },
{ id: 'KYC', label: 'KYC Documents', icon: Shield },
{ id: 'ID_CARD', label: 'ID Card', icon: User }];


export function DocumentManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);

  // New Upload State
  const [uploadData, setUploadData] = useState({
    employeeName: '',
    type: 'WAGES',
    file: null
  });

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.employeeName) return;

    const newDoc = {
      id: Math.random(),
      name: uploadData.file.name,
      type: uploadData.type,
      employeeName: uploadData.employeeName,
      employeeId: 'EMP' + Math.floor(Math.random() * 1000),
      uploadDate: new Date().toISOString().split('T')[0],
      size: (uploadData.file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'PENDING'
    };

    setDocuments([newDoc, ...documents]);
    setIsUploadModalOpen(false);
    setUploadData({ employeeName: '', type: 'WAGES', file: null });
  };

  const getIconForType = (type) => {
    const docType = DOC_TYPES.find((d) => d.id === type);
    const Icon = docType ? docType.icon : FileText;
    return <Icon size={18} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" /> Document Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Upload and manage employee documents, KYC, and payroll records</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          
          <Upload size={18} /> Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by employee or file name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${typeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            
            All Files
          </button>
          {DOC_TYPES.map((type) =>
          <button
            key={type.id}
            onClick={() => setTypeFilter(type.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${typeFilter === type.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            
              <type.icon size={14} />
              {type.label}
            </button>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocs.map((doc) =>
        <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            doc.type === 'WAGES' ? 'bg-green-100 text-green-600' :
            doc.type === 'PAYSLIP' ? 'bg-blue-100 text-blue-600' :
            doc.type === 'KYC' ? 'bg-purple-100 text-purple-600' :
            doc.type === 'ID_CARD' ? 'bg-orange-100 text-orange-600' :
            'bg-slate-100 text-slate-600'}`
            }>
                {getIconForType(doc.type)}
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
            doc.status === 'VERIFIED' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`
            }>
                {doc.status}
              </div>
            </div>
            
            <h3 className="font-bold text-slate-800 truncate mb-1" title={doc.name}>{doc.name}</h3>
            <p className="text-xs text-slate-500 mb-4">{doc.employeeName}</p>
            
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
              <span>{doc.size} • {doc.uploadDate}</span>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors" title="Download">
                  <Download size={14} />
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Upload Document</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {DOC_TYPES.map((type) =>
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setUploadData({ ...uploadData, type: type.id })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  uploadData.type === type.id ?
                  'bg-blue-50 border-blue-500 text-blue-700' :
                  'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`
                  }>
                  
                      <type.icon size={16} />
                      {type.label}
                    </button>
                )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee Name</label>
                <input
                type="text"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter employee name"
                value={uploadData.employeeName}
                onChange={(e) => setUploadData({ ...uploadData, employeeName: e.target.value })}
                required />
              
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer relative">
                  <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files ? e.target.files[0] : null })}
                  required />
                
                  {uploadData.file ?
                <div className="text-blue-600 font-medium flex items-center gap-2">
                      <FileCheck size={24} />
                      {uploadData.file.name}
                    </div> :

                <>
                      <Upload size={32} className="text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG (Max 10MB)</p>
                    </>
                }
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20">Upload Document</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>);

}