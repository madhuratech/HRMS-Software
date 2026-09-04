import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { Mail, Phone, MapPin, Search, Plus, Clock, Key, Lock, X, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { getAvatarUrl } from '../../lib/utils';
import { useToast } from '../ui/Toast';
import { AddEmployeeModal } from './AddEmployeeModal';
import { EmployeeProfile } from './EmployeeProfile';

export function EmployeeList() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Change Password state
  const [passwordModalEmp, setPasswordModalEmp] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/employees');
      if (Array.isArray(data)) {
        setEmployees(data.map(e => ({
          id: String(e.id),
          name: e.name,
          email: e.email,
          phone: e.phone || '+91 9876543210',
          branch: e.branch_name || 'Main Branch',
          role: e.role_code || e.designation_name || 'STAFF',
          department: e.dept_name || 'General',
          joinDate: e.date_of_joining ? String(e.date_of_joining).split('T')[0] : '2024-01-01',
          avatar: getAvatarUrl(e.profile_photo, e.name, e.id)
        })));
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Helper to determine today's shift allocation for visual reference
  const getTodayShift = (employeeId) => {
    // Deterministic mock based on ID to ensure consistency
    const seed = employeeId.charCodeAt(employeeId.length - 1) % 3;
    const today = new Date().getDay();

    // Weekend logic
    if (today === 0 || today === 6) return { label: 'Off Duty', color: 'bg-slate-100 text-slate-500 border-slate-200' };

    if (seed === 0) return { label: '08:00 - 16:00', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    if (seed === 1) return { label: '14:00 - 22:00', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    return { label: '22:00 - 06:00', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  };

  const handleSavePassword = async () => {
    if (!passwordModalEmp) return;
    if (!newPassword || newPassword.trim().length < 4) {
      addToast("Password must be at least 4 characters", "error");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await apiFetch(`/employees/change-password`, {
        method: 'PUT',
        body: JSON.stringify({ id: passwordModalEmp.id, newPassword })
      });
      if (res && res.message) {
        addToast(`Password for ${passwordModalEmp.name} updated successfully!`, "success");
        setPasswordModalEmp(null);
        setNewPassword('');
      } else {
        addToast(res.message || "Failed to update password", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to update password", "error");
    }
    setUpdatingPassword(false);
  };

  const generateRandomPass = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPassword(pass);
  };

  const handleAddEmployee = (data) => {
    const newEmployee = {
      id: `e${employees.length + 1}`,
      name: data.name,
      role: data.role,
      branch: data.branch,
      status: 'Active',
      joinDate: data.joinDate,
      attendance: 100,
      salesTarget: data.salesTarget ? Number(data.salesTarget) : 0
    };
    // @ts-ignore
    setEmployees([newEmployee, ...employees]);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    const matchesBranch = branchFilter === 'ALL' || emp.branch === branchFilter;
    return matchesSearch && matchesRole && matchesBranch;
  });

  if (selectedEmployee) {
    return (
      <EmployeeProfile
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)} />);


  }

  return (
    <div className="space-y-6">
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEmployee} />
      

      <div className="flex flex-col gap-4">
        {/* Advanced Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search employees by name or ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <AppDropdown
                value={roleFilter}
                onChange={v => setRoleFilter(v)}
                options={[{value:'ALL',label:'All Roles'},{value:'BRANCH_MANAGER',label:'Branch Managers'},{value:'SALES_MANAGER',label:'Sales Managers'},{value:'SERVICE_STAFF',label:'Service Staff'}]}
                size="sm"
              />

            <AppDropdown
                value={branchFilter}
                onChange={v => setBranchFilter(v)}
                options={[{value:'ALL',label:'All Branches'},{value:'New York',label:'New York'},{value:'Los Angeles',label:'Los Angeles'},{value:'Chicago',label:'Chicago'}]}
                size="sm"
              />

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
              
              <Plus size={18} /> Add Employee
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) =>
        <div key={employee.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {employee.name.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{employee.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{employee.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${employee.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                  {employee.status}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  {employee.branch}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  {employee.email || `${employee.name.toLowerCase().replace(' ', '.')}@company.com`}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  {employee.phone}
                </div>
                
                {/* Today's Shift Indicator */}
                <div className="pt-2 border-t border-slate-50 mt-2">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-400 uppercase">Today's Shift</span>
                     <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border ${getTodayShift(employee.id).color}`}>
                       <Clock size={12} />
                       {getTodayShift(employee.id).label}
                     </div>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Joined {employee.joinDate}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPasswordModalEmp(employee);
                    setNewPassword('Employee@2026');
                  }}
                  title="Change / Reset Password"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 bg-white"
                >
                  <Key size={13} className="text-blue-600" /> Password
                </button>
                <button
                  onClick={() => setSelectedEmployee(employee)}
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {passwordModalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={20} />
                <h3 className="font-bold text-slate-800">Change Employee Password</h3>
              </div>
              <button onClick={() => setPasswordModalEmp(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">{passwordModalEmp.name}</p>
                <p className="text-xs text-slate-500">{passwordModalEmp.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">New Password</label>
                  <button type="button" onClick={generateRandomPass} className="text-xs text-blue-600 font-bold hover:underline">
                    ⚡ Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalEmp(null)}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingPassword}
                  onClick={handleSavePassword}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md"
                >
                  {updatingPassword ? "Updating..." : "Save Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}