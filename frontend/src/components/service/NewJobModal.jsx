import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Wrench, User, Calendar, FileText, Car } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../../lib/mockData';







export function NewJobModal({ isOpen, onClose, onSubmit }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
    onClose();
  };

  // Filter only service staff for assignment
  const serviceStaff = MOCK_EMPLOYEES.filter((e) => e.role === 'SERVICE_STAFF');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">New Job Card</h2>
            <p className="text-sm text-slate-500">Create a new service task</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  {...register('customerName', { required: 'Customer Name is required' })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. John Doe" />
                
              </div>
              {errors.customerName && <span className="text-xs text-red-500">{errors.customerName.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Vehicle Model</label>
              <div className="relative">
                <Car className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <select
                  {...register('vehicleModel', { required: 'Vehicle Model is required' })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none">
                  
                  <option value="">Select Vehicle...</option>
                  <option value="Sport Bike X1">Sport Bike X1</option>
                  <option value="Cruiser 500">Cruiser 500</option>
                  <option value="Scooter Z">Scooter Z</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Issue Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <textarea
                  {...register('issue', { required: 'Issue description is required' })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px]"
                  placeholder="Describe the problem..." />
                
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Assigned To</label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <select
                    {...register('assignedTo', { required: 'Technician is required' })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none">
                    
                    <option value="">Select Tech...</option>
                    {serviceStaff.map((staff) =>
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                    )}
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    {...register('date', { required: 'Date is required' })}
                    type="date"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  
                </div>
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
              className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
              
              Create Job Card
            </button>
          </div>
        </form>
      </div>
    </div>);

}