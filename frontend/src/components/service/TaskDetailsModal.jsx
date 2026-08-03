import React, { useState, useEffect } from 'react';
import { X, User, Phone, Car, Wrench, CheckCircle, PlayCircle } from 'lucide-react';








export function TaskDetailsModal({ task, onClose, onUpdate }) {
  const [showPrototype, setShowPrototype] = useState(false);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState(task?.status || 'PENDING');

  useEffect(() => {
    if (task) {
      setStatus(task.status);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    onUpdate({
      ...task,
      status: status
      // In a real app, we would append the note to a history array
    });
    onClose();
  };

  if (showPrototype) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh]">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
              <PlayCircle className="text-blue-400" /> Service Simulation: {task.vehicleModel}
            </h3>
            <button
              onClick={() => setShowPrototype(false)}
              className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 text-sm font-medium">
              
              Exit Prototype
            </button>
          </div>
          
          <div className="flex-1 bg-slate-900 p-8 flex items-center justify-center relative overflow-hidden">
            {/* Mock Service Animation */}
            <div className="absolute inset-0 opacity-10">
               <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600 rounded-full blur-[100px] animate-pulse"></div>
               <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl space-y-8">
              <div className="flex justify-between text-slate-400 text-sm mb-2">
                <span>Diagnostics</span>
                <span>Repair</span>
                <span>Testing</span>
                <span>Final QC</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[65%] animate-[width_2s_ease-in-out]"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                      <CheckCircle size={18} />
                    </div>
                    <span className="text-slate-200 font-bold">Engine Diagnostics</span>
                  </div>
                  <p className="text-xs text-slate-400">Completed 10:45 AM - All sensors nominal.</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                   <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                      <Wrench size={18} />
                    </div>
                    <span className="text-slate-200 font-bold">Oil Change</span>
                  </div>
                  <p className="text-xs text-slate-400">In Progress - Draining old oil.</p>
                </div>
              </div>

              <div className="text-center pt-8">
                <p className="text-slate-500 text-sm italic">
                  Interactive Service Dashboard Prototype
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-bold text-slate-500">JOB-{task.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              task.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border-orange-200' :
              task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              'bg-green-100 text-green-700 border-green-200'}`
              }>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Car size={20} className="text-slate-400" />
              {task.vehicleModel}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">Service Visualization</h4>
                  <p className="text-xs text-blue-700">View real-time progress simulation</p>
                </div>
                <button
                  onClick={() => setShowPrototype(true)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2">
                  
                  <PlayCircle size={16} /> View Prototype
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Issue Reported</h4>
                <div className="bg-slate-50 p-4 rounded-lg text-slate-700 text-sm leading-relaxed border border-slate-100 font-medium">
                  {task.issue}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Update Progress</h4>
                <div className="space-y-3">
                  <textarea
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                    placeholder="Add work notes, parts used, or observations..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}>
                  </textarea>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <User size={14} /> Customer
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                    {task.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{task.customerName}</p>
                    <p className="text-xs text-slate-500">Premium Member</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span>+1 (555) 000-0000</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Wrench size={14} /> Assignment
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Technician</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {task.assignedTo.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        {task.assignedTo === 'unassigned' ? 'Unassigned' : 'Assigned Tech'}
                      </p>
                    </div>
                  </div>
                  <div>
                     <p className="text-xs text-slate-500">Date In</p>
                     <p className="text-sm font-bold text-slate-700">{task.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center sticky bottom-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium">
              
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">
              
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              
              Update Job
            </button>
          </div>
        </div>
      </div>
    </div>);

}