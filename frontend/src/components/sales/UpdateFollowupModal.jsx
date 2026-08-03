import React from 'react';
import { useForm } from 'react-hook-form';
import { X, MessageSquare, Calendar, Phone, Clock } from 'lucide-react';









export function UpdateFollowupModal({ isOpen, onClose, onSubmit, enquiry }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, enquiryId: enquiry.id });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Update Follow-up</h2>
            <p className="text-sm text-slate-500">Record new interaction with customer</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-slate-800">{enquiry.customerName}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <Phone size={14} /> {enquiry.phone}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {enquiry.modelInterest}
            </span>
          </div>
          
          <div className="mt-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent History</h4>
            {enquiry.remarks.slice(-2).map((remark, idx) =>
            <div key={idx} className="text-sm bg-white p-2 rounded border border-slate-200">
                <span className="text-xs text-slate-400 font-medium block mb-0.5">{remark.date}</span>
                <p className="text-slate-700">{remark.text}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">New Status</label>
              <select
                {...register('status', { required: 'Status is required' })}
                defaultValue={enquiry.status}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                
                <option value="NEW">New Enquiry</option>
                <option value="CONTACTED">Contacted</option>
                <option value="TEST_DRIVE">Test Drive</option>
                <option value="QUOTATION">Quotation Sent</option>
                <option value="BOOKED">Booked / Won</option>
                <option value="LOST">Lost / Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Follow-up Remarks</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <textarea
                  {...register('remarks', { required: 'Remarks are required' })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                  placeholder="Details of conversation..." />
                
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Next Follow-up Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  {...register('nextFollowUp', { required: 'Next date is required' })}
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
              
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
              
              <Clock size={18} />
              Update Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>);

}