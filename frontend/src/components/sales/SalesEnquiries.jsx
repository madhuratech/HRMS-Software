import React, { useState } from 'react';
import { Search, Phone, Calendar, MessageCircle, ChevronRight, UserPlus } from 'lucide-react';
import { MOCK_ENQUIRIES } from '../../lib/mockData';

import { UpdateFollowupModal } from './UpdateFollowupModal';

import { useToast } from '../ui/Toast';

export function SalesEnquiries() {
  const [enquiries, setEnquiries] = useState(MOCK_ENQUIRIES);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddLead = (e) => {
    e.preventDefault();
    setIsAddModalOpen(false);
    // In a real app, this would add the lead to the database
    const newLead = {
      id: Math.random(),
      customerName: "New Customer",
      phone: "+1 (555) 000-0000",
      status: "NEW",
      lastContact: new Date().toISOString().split('T')[0],
      nextFollowUp: new Date().toISOString().split('T')[0],
      remarks: [{ date: new Date().toISOString().split('T')[0], text: "Initial enquiry" }],
      assignedTo: 1
    };
    setEnquiries([newLead, ...enquiries]);
    addToast('New lead added successfully!', 'success');
  };

  const handleUpdate = (data) => {
    const updatedEnquiries = enquiries.map((enq) => {
      if (enq.id === data.enquiryId) {
        return {
          ...enq,
          status: data.status,
          nextFollowUp: data.nextFollowUp,
          remarks: [...enq.remarks, { date: new Date().toISOString().split('T')[0], text: data.remarks }]
        };
      }
      return enq;
    });
    setEnquiries(updatedEnquiries);
    setSelectedEnquiry(null);
    addToast('Follow-up details updated', 'success');
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch = enq.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || enq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONTACTED':return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'TEST_DRIVE':return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'QUOTATION':return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'BOOKED':return 'bg-green-100 text-green-700 border-green-200';
      case 'LOST':return 'bg-slate-100 text-slate-500 border-slate-200';
      default:return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {isAddModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Add New Lead</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter phone" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Walk-in</option>
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Phone Enquiry</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      }

      {selectedEnquiry &&
      <UpdateFollowupModal
        isOpen={true}
        onClose={() => setSelectedEnquiry(null)}
        onSubmit={handleUpdate}
        enquiry={selectedEnquiry} />

      }

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Leads & Enquiries</h2>
          <p className="text-sm text-slate-500">Manage follow-ups and customer status</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          
          <UserPlus size={18} /> Add New Lead
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
        </div>
        <select
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm text-sm font-medium text-slate-700"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          
          <option value="ALL">All Status</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="TEST_DRIVE">Test Drive</option>
          <option value="QUOTATION">Quotation</option>
          <option value="BOOKED">Booked</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredEnquiries.map((enq) =>
        <div key={enq.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                  {enq.customerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{enq.customerName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={12} /> {enq.phone}
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(enq.status)}`}>
                {enq.status.replace('_', ' ')}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Last Remark</p>
              <p className="text-sm text-slate-700 line-clamp-2">
                "{enq.remarks[enq.remarks.length - 1].text}"
              </p>
              <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                <span>{enq.remarks[enq.remarks.length - 1].date}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase">Next Follow-up</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${new Date(enq.nextFollowUp) < new Date() ? 'text-red-600' : 'text-slate-700'}`}>
                  <Calendar size={14} />
                  {enq.nextFollowUp}
                </span>
              </div>
              
              <button
              onClick={() => setSelectedEnquiry(enq)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors">
              
                <MessageCircle size={16} /> Follow Up
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

}