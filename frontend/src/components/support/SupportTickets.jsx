import React, { useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  FileText,
  AlertCircle,
  Search,

  Plus,
  CheckCircle,
  Clock,
  XCircle,

  FileBarChart } from
'lucide-react';
import { format } from 'date-fns';
import { useToast } from '../ui/Toast';
import { TicketDetailsModal } from './TicketDetailsModal';

// Mock Data
const MOCK_TICKETS = [
{
  id: 'T-1001',
  type: 'COMPLAINT',
  subject: 'AC not working in Westside Branch',
  description: 'The air conditioning in the main sales floor has been down for 2 days.',
  priority: 'HIGH',
  status: 'OPEN',
  requester: 'Mike Chen',
  role: 'Sales Manager',
  date: '2026-02-01T10:30:00'
},
{
  id: 'T-1002',
  type: 'SALARY_SLIP',
  subject: 'Request for Jan 2026 Salary Slip',
  description: 'I need my salary slip for loan application purposes.',
  priority: 'MEDIUM',
  status: 'IN_PROGRESS',
  requester: 'Sarah Wilson',
  role: 'Branch Manager',
  date: '2026-01-28T14:15:00'
},
{
  id: 'T-1003',
  type: 'COMPLAINT',
  subject: 'System login issues',
  description: 'Unable to login to the inventory module intermittently.',
  priority: 'CRITICAL',
  status: 'RESOLVED',
  requester: 'David Kim',
  role: 'Service Staff',
  date: '2026-01-25T09:00:00'
}];


export function SupportTickets() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { addToast } = useToast();
  const [newTicket, setNewTicket] = useState({
    type: 'COMPLAINT',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });

  const handleCreateTicket = () => {
    const ticket = {
      id: `T-${1000 + tickets.length + 1}`,
      ...newTicket,
      status: 'OPEN',
      requester: 'Alex Johnson', // Current User
      role: 'Super Admin',
      date: new Date().toISOString()
    };
    setTickets([ticket, ...tickets]);
    addToast('Ticket created successfully!', 'success');
    setIsModalOpen(false);
    setNewTicket({ type: 'COMPLAINT', subject: '', description: '', priority: 'MEDIUM' });
  };

  const handleStatusChange = (id, newStatus) => {
    setTickets(tickets.map((t) => t.id === id ? { ...t, status: newStatus } : t));
    // Update selected ticket as well if it's open
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
    addToast(`Ticket status updated to ${newStatus.replace('_', ' ')}`, 'info');
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS':return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'RESOLVED':return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':return 'bg-red-100 text-red-700 border-red-200';
      default:return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'COMPLAINT':return <AlertCircle size={16} className="text-red-500" />;
      case 'SALARY_SLIP':return <FileText size={16} className="text-blue-500" />;
      default:return <MessageSquare size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LifeBuoy className="text-blue-600" /> Help Desk & Support
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage complaints and request salary slips</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          
          <Plus size={18} /> New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <LifeBuoy size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Tickets</p>
            <p className="text-2xl font-bold text-slate-800">{tickets.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Pending</p>
            <p className="text-2xl font-bold text-slate-800">{tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Resolved</p>
            <p className="text-2xl font-bold text-slate-800">{tickets.filter((t) => t.status === 'RESOLVED').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <FileBarChart size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Slip Requests</p>
            <p className="text-2xl font-bold text-slate-800">{tickets.filter((t) => t.type === 'SALARY_SLIP').length}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
        </div>
        <select
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Requester</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length > 0 ?
              filteredTickets.map((ticket) =>
              <tr
                key={ticket.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => handleTicketClick(ticket)}>
                
                    <td className="p-4 font-bold text-slate-700 text-sm">{ticket.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        {getTypeIcon(ticket.type)}
                        {ticket.type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800 text-sm">{ticket.subject}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{ticket.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800 text-sm">{ticket.requester}</div>
                      <div className="text-xs text-slate-500">{ticket.role}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {format(new Date(ticket.date), 'MMM d, yyyy')}
                      <div className="text-xs text-slate-400">{format(new Date(ticket.date), 'h:mm a')}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${
                  ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-200' :
                  ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                  'bg-blue-100 text-blue-700 border-blue-200'}`
                  }>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'OPEN' && <AlertCircle size={12} />}
                        {ticket.status === 'IN_PROGRESS' && <Clock size={12} />}
                        {ticket.status === 'RESOLVED' && <CheckCircle size={12} />}
                        {ticket.status === 'REJECTED' && <XCircle size={12} />}
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {ticket.status !== 'RESOLVED' &&
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(ticket.id, 'RESOLVED');
                      }}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-all"
                      title="Mark as Resolved">
                      
                            <CheckCircle size={16} />
                          </button>
                    }
                         {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' &&
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(ticket.id, 'IN_PROGRESS');
                      }}
                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded border border-transparent hover:border-yellow-200 transition-all"
                      title="Mark In Progress">
                      
                            <Clock size={16} />
                          </button>
                    }
                      </div>
                    </td>
                  </tr>
              ) :

              <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No tickets found matching your search.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket &&
      <TicketDetailsModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={handleStatusChange} />

      }

      {/* New Ticket Modal */}
      {isModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">New Support Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Request Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                  onClick={() => setNewTicket({ ...newTicket, type: 'COMPLAINT' })}
                  className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 transition-all ${
                  newTicket.type === 'COMPLAINT' ?
                  'bg-red-50 border-red-500 text-red-700' :
                  'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`
                  }>
                  
                    <AlertCircle size={20} /> Complaint
                  </button>
                  <button
                  onClick={() => setNewTicket({ ...newTicket, type: 'SALARY_SLIP' })}
                  className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 transition-all ${
                  newTicket.type === 'SALARY_SLIP' ?
                  'bg-blue-50 border-blue-500 text-blue-700' :
                  'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`
                  }>
                  
                    <FileText size={20} /> Salary Slip
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={newTicket.type === 'SALARY_SLIP' ? "e.g., Request for Jan 2026 Slip" : "Brief summary of issue"}
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} />
              
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Provide detailed information..."
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}>
              </textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}>
                
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-lg">
                
                  Cancel
                </button>
                <button
                onClick={handleCreateTicket}
                disabled={!newTicket.subject || !newTicket.description}
                className="flex-1 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

}