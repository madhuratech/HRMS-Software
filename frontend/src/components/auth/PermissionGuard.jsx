import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function PermissionGuard({ moduleKey, children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkPerms = async () => {
      let userRole = localStorage.getItem('userRole');
      if (!userRole) {
        try {
          const auth = localStorage.getItem('hrms_auth');
          if (auth) {
            const parsed = JSON.parse(auth);
            userRole = parsed.role || (parsed.user && parsed.user.role);
          }
        } catch (e) {}
      }
      userRole = userRole || 'EMPLOYEE';

      const normRole = String(userRole).toUpperCase().replace(/_/g, ' ');

      // Super Admin and Admin always have full access
      if (normRole === 'SUPER ADMIN' || normRole === 'SUPERADMIN' || normRole === 'ADMIN') {
        if (isMounted) {
          setAllowed(true);
          setLoading(false);
        }
        return;
      }

      try {
        // Try fetching latest backend permissions
        const data = await apiFetch('/rbac/user-permissions');
        if (data && data.success && data.data) {
          const perms = data.data;
          const modPerm = perms[moduleKey];
          // If module permission is explicitly set to view: false
          if (modPerm && modPerm.view === false) {
            if (isMounted) setAllowed(false);
          } else {
            if (isMounted) setAllowed(true);
          }
        }
      } catch (err) {
        console.error('Error checking permission for module:', moduleKey, err);
        // Fallback to local storage or allow default if offline
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkPerms();

    // Listen for real-time permission updates
    const handlePermUpdate = () => checkPerms();
    window.addEventListener('permissionsUpdated', handlePermUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('permissionsUpdated', handlePermUpdate);
    };
  }, [moduleKey]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6 text-slate-500">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
        <span>Verifying access permissions...</span>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">
            You don't have permission to access this module. Please contact your administrator.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
