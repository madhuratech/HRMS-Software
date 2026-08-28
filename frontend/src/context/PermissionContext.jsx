import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import { hasPermission as checkHasPermission, normalizeBoolean } from '../lib/permissions';

const PermissionContext = createContext({
  permissions: null,
  userRole: 'EMPLOYEE',
  loadingPermissions: true,
  refreshPermissions: async () => {},
  hasPermission: () => false,
  canView: () => false,
  canCreate: () => false,
  canEdit: () => false,
  canDelete: () => false,
});

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState(() => {
    try {
      const stored = localStorage.getItem('hrms_permissions');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [userRole, setUserRole] = useState(() => {
    try {
      const auth = localStorage.getItem('hrms_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        return parsed.role || (parsed.user && parsed.user.role) || 'EMPLOYEE';
      }
      return localStorage.getItem('userRole') || 'EMPLOYEE';
    } catch (e) {
      return 'EMPLOYEE';
    }
  });

  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const refreshPermissions = useCallback(async (roleOverride = null) => {
    try {
      let roleToUse = roleOverride;
      if (!roleToUse) {
        const auth = localStorage.getItem('hrms_auth');
        if (auth) {
          try {
            const parsed = JSON.parse(auth);
            roleToUse = parsed.role || (parsed.user && parsed.user.role);
          } catch (e) { }
        }
      }
      if (!roleToUse) roleToUse = localStorage.getItem('userRole') || 'EMPLOYEE';

      setUserRole(roleToUse);

      console.log('[PermissionContext] Fetching fresh permissions for role:', roleToUse);
      const res = await apiFetch(`/rbac/user-permissions?role=${encodeURIComponent(roleToUse)}`, {
        headers: { 'x-user-role': roleToUse }
      });

      if (res && res.success && (res.permissions || res.data)) {
        const freshPerms = res.permissions || res.data;
        setPermissions(freshPerms);
        localStorage.setItem('hrms_permissions', JSON.stringify(freshPerms));
        console.log('[PermissionContext] Fresh permissions synced to state & localStorage OK:', Object.keys(freshPerms).length, 'keys');
      }
    } catch (err) {
      console.error('[PermissionContext] Failed to fetch permissions:', err);
    } finally {
      setLoadingPermissions(false);
    }
  }, []);

  useEffect(() => {
    refreshPermissions();

    const handlePermissionsUpdated = (e) => {
      console.log('[PermissionContext] permissionsUpdated event triggered, refreshing...');
      refreshPermissions();
    };

    window.addEventListener('permissionsUpdated', handlePermissionsUpdated);
    window.addEventListener('storage', (e) => {
      if (e.key === 'hrms_permissions' || e.key === 'hrms_auth' || e.key === 'userRole') {
        refreshPermissions();
      }
    });

    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdated);
    };
  }, [refreshPermissions]);

  const hasPerm = useCallback((moduleKey, submoduleKey = null, action = 'view') => {
    return checkHasPermission(permissions, userRole, moduleKey, submoduleKey, action);
  }, [permissions, userRole]);

  const viewPerm = useCallback((moduleKey, submoduleKey = null) => hasPerm(moduleKey, submoduleKey, 'view'), [hasPerm]);
  const createPerm = useCallback((moduleKey, submoduleKey = null) => hasPerm(moduleKey, submoduleKey, 'create'), [hasPerm]);
  const editPerm = useCallback((moduleKey, submoduleKey = null) => hasPerm(moduleKey, submoduleKey, 'edit'), [hasPerm]);
  const deletePerm = useCallback((moduleKey, submoduleKey = null) => hasPerm(moduleKey, submoduleKey, 'delete'), [hasPerm]);

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        userRole,
        loadingPermissions,
        refreshPermissions,
        hasPermission: hasPerm,
        canView: viewPerm,
        canCreate: createPerm,
        canEdit: editPerm,
        canDelete: deletePerm,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}
