import React from 'react';
import { useForm } from 'react-hook-form';
import { X, User, Mail, Briefcase, MapPin, Calendar, Phone } from 'lucide-react';


export function AddEmployeeModal({ isOpen, onClose, onSubmit }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  if (!isOpen) return null;

 const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }
      const newEmployee = await response.json();
      onSubmit(newEmployee); 
      reset();
      onClose();
      alert("Employee added successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Employee</h2>
            <p className="text-sm text-slate-500">Enter personal details and role assignment</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-blue-600" /> 
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Sarah Wilson" />
                
                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="sarah@company.com" />
                  
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    {...register('phone', { required: 'Phone is required' })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="+1 (555) 000-0000" />
                  
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                <input
                  {...register('dob')}
                  type="date"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" /> 
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" /> 
              Role & Branch Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Assigned Branch</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <select
                    {...register('branch', { required: 'Branch is required' })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none">
                    
                    <option value="">Select Branch</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Thirupur">Thirupur</option>
                    <option value="Erode">Erode</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role Designation</label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  
                  <option value="">Select Role...</option>
                  <option value="BRANCH_MANAGER">Branch Manager</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="SERVICE_STAFF">Service Staff</option>
                  <option value="ADMIN">Admin (Head Office)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Joining Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    {...register('joinDate', { required: 'Joining Date is required' })}
                    type="date"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Monthly Sales Target ($)</label>
                <input
                  {...register('salesTarget')}
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                
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
              
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>);

}