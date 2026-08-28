/**
 * Safe Boolean Normalization Function
 * Converts true, 1, "1", "true" -> true
 * Converts false, 0, "0", "false", null, undefined -> false
 */
export function normalizeBoolean(val) {
  if (val === true || val === 1 || val === '1' || val === 'true') {
    return true;
  }
  return false;
}

/**
 * Centralized Permission Helper for HRMS
 * Supports Module -> Submodule -> Action (view, create, edit, delete)
 * DO NOT inherit 'create', 'edit', or 'delete' from 'view'. Each action is checked independently.
 */
export function hasPermission(userPermissions, userRole, moduleKey, submoduleKey = null, action = 'view') {
  // 1. Dashboard is static and always allowed for all users
  if (moduleKey === 'dashboard' || submoduleKey === 'dashboard' || submoduleKey === 'dashboard_overview') {
    return true;
  }

  if (!userRole) {
    try {
      const auth = localStorage.getItem('hrms_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        userRole = parsed.role || (parsed.user && parsed.user.role);
      }
      if (!userRole) {
        userRole = localStorage.getItem('userRole');
      }
    } catch (e) { }
  }
  userRole = userRole || 'EMPLOYEE';

  const normRole = String(userRole).toUpperCase().replace(/_/g, ' ');

  // 2. Super Admin & Admin always have full unrestricted permissions
  if (normRole === 'SUPER ADMIN' || normRole === 'SUPERADMIN' || normRole === 'ADMIN') {
    return true;
  }

  if (!userPermissions) {
    try {
      const stored = localStorage.getItem('hrms_permissions');
      if (stored) {
        userPermissions = JSON.parse(stored);
      }
    } catch (e) { }
  }

  // 3. If user permissions missing or not loaded yet -> STRICT DENY (return false)
  if (!userPermissions) {
    return false;
  }

  const actKey = String(action).toLowerCase();
  const actKeyAlt = actKey === 'view' ? 'canView' : actKey === 'create' ? 'canCreate' : actKey === 'edit' ? 'canEdit' : 'canDelete';
  const actKeyDb = actKey === 'view' ? 'can_view' : actKey === 'create' ? 'can_create' : actKey === 'edit' ? 'can_edit' : 'can_delete';

  const extractVal = (obj) => {
    if (!obj) return undefined;
    if (obj[actKey] !== undefined) return obj[actKey];
    if (obj[actKeyAlt] !== undefined) return obj[actKeyAlt];
    if (obj[actKeyDb] !== undefined) return obj[actKeyDb];
    return undefined;
  };

  // Search for direct submodule key permission entry FIRST
  if (submoduleKey) {
    if (userPermissions[submoduleKey] !== undefined && userPermissions[submoduleKey] !== null) {
      const val = extractVal(userPermissions[submoduleKey]);
      if (val !== undefined) return normalizeBoolean(val);
    }
    const combinedKey = `${moduleKey}.${submoduleKey}`;
    if (userPermissions[combinedKey] !== undefined && userPermissions[combinedKey] !== null) {
      const val = extractVal(userPermissions[combinedKey]);
      if (val !== undefined) return normalizeBoolean(val);
    }
    if (moduleKey && userPermissions[moduleKey] && userPermissions[moduleKey].submodules && userPermissions[moduleKey].submodules[submoduleKey]) {
      const val = extractVal(userPermissions[moduleKey].submodules[submoduleKey]);
      if (val !== undefined) return normalizeBoolean(val);
    }
    // Submodule permission not found -> Return FALSE (DO NOT fallback to parent module)
    return false;
  }

  // Check parent module permission entry ONLY if submodule key was not provided
  if (!submoduleKey && moduleKey && userPermissions[moduleKey] !== undefined && userPermissions[moduleKey] !== null) {
    const val = extractVal(userPermissions[moduleKey]);
    if (val !== undefined) return normalizeBoolean(val);
  }

  // 4. Permission entry not found -> Return FALSE (DO NOT default allow)
  return false;
}

export function canView(userPermissions, userRole, moduleKey, submoduleKey = null) {
  return hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'view');
}

export function canCreate(userPermissions, userRole, moduleKey, submoduleKey = null) {
  return hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'create');
}

export function canEdit(userPermissions, userRole, moduleKey, submoduleKey = null) {
  return hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'edit');
}

export function canDelete(userPermissions, userRole, moduleKey, submoduleKey = null) {
  return hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'delete');
}

/**
 * Reusable Action Guard for button clicks & form triggers.
 * Verifies permission for action ('create', 'edit', 'delete', 'view').
 * If permitted: executes optional callback and returns true.
 * If denied: displays Permission Denied popup alert and toast, returning false.
 */
export function requireActionPermission(moduleKey, submoduleKey = null, action = 'create', callback = null, addToastFn = null, customMessage = null, userPermissions = null, userRole = null) {
  const allowed = hasPermission(userPermissions, userRole, moduleKey, submoduleKey, action);
  if (!allowed) {
    const actLabel = action === 'create' ? 'create' : action === 'edit' ? 'edit' : action === 'delete' ? 'delete' : 'access';
    const msg = customMessage || `You do not have permission to ${actLabel} in this module. Please contact your administrator.`;

    if (addToastFn) {
      addToastFn(`Permission Denied: ${msg}`, 'error');
    }
    alert(`⚠️ Permission Denied\n\n${msg}`);
    return false;
  }
  if (callback && typeof callback === 'function') {
    callback();
  }
  return true;
}

export function guardCreateAction(userPermissions, userRole, moduleKey, submoduleKey = null, addToastFn = null, customMessage = null) {
  return requireActionPermission(moduleKey, submoduleKey, 'create', null, addToastFn, customMessage, userPermissions, userRole);
}

