import React from 'react';
import { X, User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';







export function TicketDetailsModal({ ticket, onClose, onStatusChange }) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-bold text-slate-500">#{ticket.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
              ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border-green-200' :
              'bg-slate-100 text-slate-700'}`
              }>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{ticket.subject}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Description</h4>
                <div className="bg-slate-50 p-4 rounded-lg text-slate-700 text-sm leading-relaxed border border-slate-100">
                  {ticket.description}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Timeline</h4>
                <div className="border-l-2 border-slate-200 pl-4 space-y-6 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                    <p className="text-sm font-bold text-slate-800">Ticket Created</p>
                    <p className="text-xs text-slate-500">{format(new Date(ticket.date), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                  {ticket.status !== 'OPEN' &&
                  <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-yellow-500 border-2 border-white"></div>
                      <p className="text-sm font-bold text-slate-800">Processing Started</p>
                      <p className="text-xs text-slate-500">{format(new Date(ticket.date), 'MMM d, yyyy h:mm a')} (Automated)</p>
                    </div>
                  }
                  {ticket.status === 'RESOLVED' &&
                  <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                      <p className="text-sm font-bold text-slate-800">Resolved</p>
                      <p className="text-xs text-slate-500">Ticket closed by admin</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <User size={14} /> Requester Details
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                    {ticket.requester.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{ticket.requester}</p>
                    <p className="text-xs text-slate-500">{ticket.role}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} className="text-slate-400" />
                    <span>{ticket.requester.toLowerCase().replace(' ', '.')}@company.com</span>
                  </div>
                   <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    <span>Main Branch, NY</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <AlertCircle size={14} /> Ticket Info
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Priority</p>
                    <p className={`text-sm font-bold ${
                    ticket.priority === 'CRITICAL' ? 'text-red-600' :
                    ticket.priority === 'HIGH' ? 'text-orange-600' : 'text-slate-700'}`
                    }>{ticket.priority}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="text-sm font-bold text-slate-700">{ticket.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center sticky bottom-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">Update Status:</span>
            <select
              value={ticket.status}
              onChange={(e) => onStatusChange(ticket.id, e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium">
              
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors shadow-sm">
            
            Done
          </button>
        </div>
      </div>
    </div>);

}