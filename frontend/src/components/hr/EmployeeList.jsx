import React, { useState } from 'react';
import { Mail, Phone, MapPin, Search, Plus, Clock } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../../lib/mockData';
import { AddEmployeeModal } from './AddEmployeeModal';
import { EmployeeProfile } from './EmployeeProfile';

export function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

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
            <select
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 font-medium"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}>
              
              <option value="ALL">All Roles</option>
              <option value="BRANCH_MANAGER">Branch Managers</option>
              <option value="SALES_MANAGER">Sales Managers</option>
              <option value="SERVICE_STAFF">Service Staff</option>
            </select>

            <select
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 font-medium"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}>
              
              <option value="ALL">All Branches</option>
              <option value="New York">New York</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Chicago">Chicago</option>
            </select>

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
                  {employee.name.toLowerCase().replace(' ', '.')}@company.com
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  +1 (555) 000-{Math.floor(Math.random() * 9000) + 1000}
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
              <button
              onClick={() => setSelectedEmployee(employee)}
              className="text-blue-600 font-semibold hover:text-blue-700">
              
                View Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

}