import React from 'react';
import { 
  Users, 
  Building2, 
  Briefcase,
  ChevronDown
} from 'lucide-react';

const ORG_DATA = {
  name: 'Sarah Jenkins',
  title: 'CEO',
  department: 'Management',
  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  children: [
    {
      name: 'Emily Watson',
      title: 'HR Manager',
      department: 'Human Resources',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      children: [
        { name: 'Tom Harris', title: 'HR Executive', department: 'Human Resources', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
        { name: 'Lisa Ray', title: 'Recruiter', department: 'Human Resources', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
      ]
    },
    {
      name: 'David Chen',
      title: 'Development Manager',
      department: 'Technology',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      children: [
        {
          name: 'Alex Rivera',
          title: 'Team Lead',
          department: 'Technology',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          children: [
            { name: 'James Wilson', title: 'Senior Developer', department: 'Technology', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
            { name: 'Mark Evans', title: 'Junior Developer', department: 'Technology', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' }
          ]
        }
      ]
    },
    {
      name: 'Priya Sharma',
      title: 'QA Manager',
      department: 'Quality Assurance',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      children: [
        { name: 'Elena Rodriguez', title: 'QA Lead', department: 'Quality Assurance', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
        { name: 'John Doe', title: 'QA Engineer', department: 'Quality Assurance', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' }
      ]
    },
    {
      name: 'Michael Chang',
      title: 'Finance Manager',
      department: 'Finance',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      children: [
        { name: 'Sarah Miller', title: 'Accountant', department: 'Finance', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
        { name: 'Robert Fox', title: 'Finance Executive', department: 'Finance', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }
      ]
    }
  ]
};

const OrgNode = ({ node }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-[280px] flex flex-col items-center relative z-10 hover:shadow-md transition-shadow">
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-sm mb-3">
          <img src={node.image} alt={node.name} className="w-full h-full object-cover" />
        </div>
        <h3 className="text-[#0A1629] font-bold text-base mb-1">{node.name}</h3>
        <p className="text-blue-600 font-medium text-[13px] mb-2">{node.title}</p>
        <div className="bg-slate-50 px-3 py-1.5 rounded-full text-slate-600 text-xs font-semibold flex items-center gap-1.5 border border-slate-100">
          <Briefcase size={12} />
          {node.department}
        </div>
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="relative flex flex-col items-center mt-6">
          {/* Vertical line down from parent */}
          <div className="absolute -top-6 w-px h-6 bg-slate-300"></div>
          
          <div className="flex relative pt-6">
            {node.children.map((child, index) => (
              <div key={index} className="relative flex flex-col items-center px-4">
                {/* Horizontal lines connecting children perfectly */}
                {index > 0 && (
                  <div className="absolute -top-6 right-1/2 w-1/2 h-px bg-slate-300"></div>
                )}
                {index < node.children.length - 1 && (
                  <div className="absolute -top-6 left-1/2 w-1/2 h-px bg-slate-300"></div>
                )}
                
                {/* Vertical line up from child */}
                <div className="absolute -top-6 w-px h-6 bg-slate-300"></div>
                <OrgNode node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OrganizationChart = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1629]">Organization Chart</h1>
          <p className="text-sm text-slate-500 mt-1">Hierarchical view of company structure.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-slate-600">Executive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-slate-600">Management</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
            <span className="text-sm font-medium text-slate-600">Staff</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 overflow-x-auto min-h-[600px] flex justify-center">
        <div className="py-8">
          <OrgNode node={ORG_DATA} />
        </div>
      </div>
    </div>
  );
};
