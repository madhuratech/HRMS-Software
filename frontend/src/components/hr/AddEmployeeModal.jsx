import React, { useState, useRef } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { useForm } from 'react-hook-form';
import { X, User, Mail, Briefcase, MapPin, Calendar, Phone, UploadCloud, Plus, Trash2, Building } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import EmployeeAvatar from '../employee/EmployeeAvatar';

export function AddEmployeeModal({ isOpen, onClose, onSubmit }) {
  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const photoInputRef = useRef(null);

  // Previous Experience States
  const [experienceType, setExperienceType] = useState('Experienced');
  const [previousExperiences, setPreviousExperiences] = useState([]);

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Photo must be under 2MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddPreviousCompany = () => {
    setPreviousExperiences(prev => [
      ...prev,
      {
        id: Date.now(),
        company_name: '',
        designation: '',
        employment_type: 'Full-time',
        start_date: '',
        end_date: '',
        total_years: 0,
        total_months: 0,
        relevant_years: 0,
        relevant_months: 0,
        company_location: '',
        last_drawn_ctc: ''
      }
    ]);
  };

  const handleUpdateExperience = (id, field, value) => {
    setPreviousExperiences(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'start_date' || field === 'end_date') {
        const sDate = field === 'start_date' ? value : item.start_date;
        const eDate = field === 'end_date' ? value : item.end_date;
        if (sDate && eDate) {
          const s = new Date(sDate);
          const e = new Date(eDate);
          if (e >= s) {
            let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
            const yrs = Math.floor(months / 12);
            const mos = months % 12;
            updated.total_years = yrs;
            updated.total_months = mos;
            if (!updated.relevant_years && !updated.relevant_months) {
              updated.relevant_years = yrs;
              updated.relevant_months = mos;
            }
          }
        }
      }
      return updated;
    }));
  };

  const handleRemoveExperience = (id) => {
    setPreviousExperiences(prev => prev.filter(item => item.id !== id));
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        experience_type: experienceType,
        experience: experienceType === 'Fresher' ? 'Fresher' : (data.experience || 'Experienced'),
        previous_experiences: experienceType === 'Fresher' ? [] : previousExperiences.filter(e => e.company_name && e.company_name.trim())
      };

      const response = await apiFetch('/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response || response.message === 'Employee creation failed' || response.error) {
        throw new Error(response?.message || response?.error || 'Failed to create employee');
      }

      const newEmpId = response.id;
      if (photoFile && newEmpId) {
        const photoData = new FormData();
        photoData.append('photo', photoFile);
        await apiFetch(`/employees/${newEmpId}/photo`, {
          method: 'POST',
          body: photoData
        });
      }

      onSubmit(response); 
      reset();
      setPhotoFile(null);
      setPhotoPreview(null);
      setPreviousExperiences([]);
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
            <p className="text-sm text-slate-500">Enter personal details, role assignment, and previous experience</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Profile Photo Upload */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <EmployeeAvatar
              name={watch('name') || 'New Employee'}
              photoUrl={photoPreview}
              size={64}
            />
            <div>
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="px-3.5 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 border border-blue-200"
              >
                <UploadCloud size={14} /> Upload Profile Photo
              </button>
              <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, WebP (Max 2MB)</p>
            </div>
          </div>

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
                    placeholder="+91 99999 99999" />
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
                  <AppDropdown value={watch('branch') || ''} onChange={val => setValue('branch', val, { shouldValidate: true })} options={[{value:'',label:'Select Branch'},{value:'Coimbatore',label:'Coimbatore'},{value:'Chennai',label:'Chennai'},{value:'Thirupur',label:'Thirupur'},{value:'Erode',label:'Erode'}]} size="sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role Designation</label>
                <AppDropdown value={watch('role') || ''} onChange={val => setValue('role', val, { shouldValidate: true })} options={[{value:'',label:'Select Role...'},{value:'BRANCH_MANAGER',label:'Branch Manager'},{value:'SALES_MANAGER',label:'Sales Manager'},{value:'SERVICE_STAFF',label:'Service Staff'},{value:'ADMIN',label:'Admin (Head Office)'}]} size="sm" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Employee Shift Type</label>
                <AppDropdown
                  value={watch('shiftType') || 'Regular Shift'}
                  onChange={val => setValue('shiftType', val, { shouldValidate: true })}
                  options={[
                    { value: 'Regular Shift', label: 'Regular Shift' },
                    { value: 'Rotational Shift', label: 'Rotational Shift' },
                    { value: 'Contract Shift', label: 'Contract Shift' }
                  ]}
                  size="sm"
                />
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
                <label className="text-sm font-medium text-slate-700">Monthly Gross Salary (INR)</label>
                <input
                  {...register('salary')}
                  type="number"
                  placeholder="60000"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Initial Login Password</label>
                <input
                  {...register('password')}
                  type="text"
                  defaultValue="Employee@2026"
                  placeholder="Set login password..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm" />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          {/* Previous Experience Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building size={16} className="text-blue-600" /> 
                Previous Experience & History
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setExperienceType('Experienced')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${experienceType === 'Experienced' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                >
                  Experienced
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExperienceType('Fresher');
                    setPreviousExperiences([]);
                    setValue('experience', 'Fresher');
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${experienceType === 'Fresher' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
                >
                  Fresher
                </button>
              </div>
            </div>

            {experienceType === 'Fresher' ? (
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-center">
                <p className="text-xs text-purple-700 font-semibold">Candidate registered as Fresher (0 previous experience)</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Total Experience Summary</label>
                  <input
                    {...register('experience')}
                    type="text"
                    placeholder="e.g. 3 Years 6 Months"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-600">Previous Companies ({previousExperiences.length})</span>
                  <button
                    type="button"
                    onClick={handleAddPreviousCompany}
                    className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-200"
                  >
                    <Plus size={13} /> Add Company
                  </button>
                </div>

                {previousExperiences.map((exp, idx) => (
                  <div key={exp.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Company #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-red-500 text-xs font-semibold hover:underline flex items-center gap-0.5"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Company Name *"
                        value={exp.company_name}
                        onChange={e => handleUpdateExperience(exp.id, 'company_name', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Designation / Role *"
                        value={exp.designation}
                        onChange={e => handleUpdateExperience(exp.id, 'designation', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        type="date"
                        placeholder="Start Date"
                        value={exp.start_date}
                        onChange={e => handleUpdateExperience(exp.id, 'start_date', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={exp.end_date}
                        onChange={e => handleUpdateExperience(exp.id, 'end_date', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}