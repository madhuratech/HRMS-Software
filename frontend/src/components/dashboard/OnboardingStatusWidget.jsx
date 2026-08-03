import React from 'react';
import { CheckCircle, Clock, FileText, UserCheck, Shield } from 'lucide-react';





export function OnboardingStatusWidget({ status }) {
  // Define steps and their completion logic
  const steps = [
  { id: 'registration', label: 'Registration', icon: <UserCheck size={16} />, completed: true },
  { id: 'documents', label: 'Documents', icon: <FileText size={16} />, completed: status !== 'NOT_STARTED' },
  { id: 'verification', label: 'Verification', icon: <Shield size={16} />, completed: status === 'COMPLETED' || status === 'VERIFICATION_PENDING' },
  { id: 'active', label: 'Active', icon: <CheckCircle size={16} />, completed: status === 'COMPLETED' }];


  const getCurrentStepIndex = () => {
    if (status === 'COMPLETED') return 4;
    if (status === 'VERIFICATION_PENDING') return 2;
    if (status === 'DOCUMENT_SUBMISSION') return 1;
    return 0;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Shield className="text-blue-600" size={20} />
        Onboarding Status
      </h3>
      
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 rounded-full -z-10"></div>
        
        {/* Active Progress Bar */}
        <div
          className="absolute top-4 left-0 h-1 bg-green-500 rounded-full -z-10 transition-all duration-500 ease-in-out"
          style={{ width: `${currentStep / 3 * 100}%` }}>
        </div>

        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                    ${isCompleted ?
                  'bg-green-500 border-green-500 text-white' :
                  'bg-white border-slate-200 text-slate-400'}`
                  }>
                  
                  {isCompleted ? <CheckCircle size={16} /> : step.icon}
                </div>
                <span className={`text-xs font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>);

          })}
        </div>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
          <Clock className="text-blue-600 mt-0.5" size={18} />
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Current Status: {status.replace('_', ' ')}</h4>
            <p className="text-xs text-slate-600 mt-1">
              {status === 'NOT_STARTED' && 'Please complete your profile details.'}
              {status === 'DOCUMENT_SUBMISSION' && 'Please upload your KYC and educational documents.'}
              {status === 'VERIFICATION_PENDING' && 'Admin is verifying your submitted documents.'}
              {status === 'COMPLETED' && 'You are fully onboarded and active!'}
            </p>
          </div>
        </div>
      </div>
    </div>);

}