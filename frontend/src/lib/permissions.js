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

export function getLocalRoleAndPermissions() {
  let role = 'EMPLOYEE';
  let permissions = null;
  
  try {
    const auth = localStorage.getItem('hrms_auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      const userObj = parsed.user || parsed;
      role = parsed.role || userObj.role || localStorage.getItem('userRole') || 'EMPLOYEE';
    } else {
      role = localStorage.getItem('userRole') || 'EMPLOYEE';
    }
  } catch (e) {}

  try {
    const stored = localStorage.getItem('hrms_permissions');
    if (stored) {
      permissions = JSON.parse(stored);
    }
  } catch (e) {}
  
  return { role, permissions };
}

export function resolveModuleKeys(modKey) {
  const cleanKey = String(modKey).toLowerCase().trim();

  // Performance module submodules
  if (['goals', 'goal'].includes(cleanKey)) return { moduleKey: 'performance', submoduleKey: 'goals' };
  if (['kpi', 'kpis'].includes(cleanKey)) return { moduleKey: 'performance', submoduleKey: 'kpis' };
  if (['kra', 'kras'].includes(cleanKey)) return { moduleKey: 'performance', submoduleKey: 'kras' };
  if (['appraisal', 'appraisals'].includes(cleanKey)) return { moduleKey: 'performance', submoduleKey: 'appraisals' };
  if (['review', 'reviews'].includes(cleanKey)) return { moduleKey: 'performance', submoduleKey: 'reviews' };
  if (['feedback'].includes(cleanKey)) return { moduleKey: 'performance', submoduleKey: 'feedback' };
  if (['promotion', 'promotions', 'performance_promotions'].includes(cleanKey)) return { moduleKey: 'performance', submoduleKey: 'performance_promotions' };

  // Leave module submodules
  if (['my_leave', 'my-leave', 'myleave'].includes(cleanKey)) return { moduleKey: 'leave', submoduleKey: 'my_leave' };
  if (['leave_balance', 'leave-balance'].includes(cleanKey)) return { moduleKey: 'leave', submoduleKey: 'leave_balance' };
  if (['leave_dashboard', 'leave-dashboard'].includes(cleanKey)) return { moduleKey: 'leave', submoduleKey: 'leave_dashboard' };
  if (['leave_approval', 'leave-approval'].includes(cleanKey)) return { moduleKey: 'leave', submoduleKey: 'leave_approval' };
  if (['leave_types', 'leave-types'].includes(cleanKey)) return { moduleKey: 'leave', submoduleKey: 'leave_types' };
  if (['holiday_list', 'holiday-list'].includes(cleanKey)) return { moduleKey: 'leave', submoduleKey: 'holiday_list' };

  // Attendance module submodules
  if (['daily_attendance', 'daily-attendance'].includes(cleanKey)) return { moduleKey: 'attendance', submoduleKey: 'daily_attendance' };
  if (['gps_attendance', 'gps-attendance'].includes(cleanKey)) return { moduleKey: 'attendance', submoduleKey: 'gps_attendance' };
  if (['regularization'].includes(cleanKey)) return { moduleKey: 'attendance', submoduleKey: 'regularization' };
  if (['shift_roster', 'shift-roster'].includes(cleanKey)) return { moduleKey: 'attendance', submoduleKey: 'shift_roster' };

  // Projects submodules
  if (['tasks', 'task'].includes(cleanKey)) return { moduleKey: 'projects', submoduleKey: 'tasks' };
  if (['sprints', 'sprint', 'sprint_board'].includes(cleanKey)) return { moduleKey: 'projects', submoduleKey: 'sprint_board' };
  if (['timesheets', 'timesheet'].includes(cleanKey)) return { moduleKey: 'projects', submoduleKey: 'timesheets' };

  // Recruitment submodules
  if (['screening', 'candidate_screening', 'candidate-screening'].includes(cleanKey)) return { moduleKey: 'recruitment', submoduleKey: 'screening' };

  // Default: pass key as moduleKey
  return { moduleKey: cleanKey, submoduleKey: null };
}

export function showPermissionDenied(customMsg = null) {
  if (document.getElementById('permission-denied-popup-root')) return;

  const root = document.createElement('div');
  root.id = 'permission-denied-popup-root';
  root.style.position = 'fixed';
  root.style.inset = '0';
  root.style.display = 'flex';
  root.style.alignItems = 'center';
  root.style.justifyContent = 'center';
  root.style.backgroundColor = 'rgba(15, 23, 42, 0.4)';
  root.style.backdropFilter = 'blur(4px)';
  root.style.zIndex = '999999';
  root.style.fontFamily = '"Inter", -apple-system, sans-serif';

  const modal = document.createElement('div');
  modal.style.background = '#FFFFFF';
  modal.style.borderRadius = '16px';
  modal.style.width = '90%';
  modal.style.maxWidth = '380px';
  modal.style.padding = '24px';
  modal.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';
  modal.style.textAlign = 'center';
  modal.style.border = '1px solid #E5E7EB';

  if (!document.getElementById('permission-modal-anim-style')) {
    const style = document.createElement('style');
    style.id = 'permission-modal-anim-style';
    style.textContent = `
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  modal.style.animation = 'scaleIn 0.2s ease-out';

  const displayMessage = customMsg || 'You do not have permission to perform this action.';

  modal.innerHTML = `
    <div style="width: 52px; height: 52px; border-radius: 50%; background-color: #FEF2F2; color: #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    </div>
    <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #1E293B;">Permission Denied</h3>
    <p style="margin: 0 0 20px; font-size: 13px; color: #64748B; line-height: 1.5;">${displayMessage}</p>
    <button id="close-permission-denied-btn" style="width: 100%; height: 40px; background-color: #1E293B; color: #FFFFFF; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color 0.15s;">
      Dismiss
    </button>
  `;

  root.appendChild(modal);
  document.body.appendChild(root);

  const closeBtn = modal.querySelector('#close-permission-denied-btn');
  const dismiss = () => root.remove();
  
  closeBtn.addEventListener('click', dismiss);
  root.addEventListener('click', (e) => {
    if (e.target === root) dismiss();
  });

  setTimeout(() => {
    if (document.body.contains(root)) dismiss();
  }, 3500);
}

/**
 * Centralized Permission Helper for HRMS
 * Flexible signature support:
 * 1) hasPermission('KRAS', 'CREATE')
 * 2) hasPermission(userPermissions, userRole, 'performance', 'kras', 'create')
 */
export function hasPermission(arg1, arg2, arg3 = null, arg4 = null, arg5 = 'view') {
  let userPermissions = null;
  let userRole = null;
  let moduleKey = null;
  let submoduleKey = null;
  let action = 'view';

  if (typeof arg1 === 'string') {
    const { role, permissions } = getLocalRoleAndPermissions();
    userRole = role;
    userPermissions = permissions;
    
    const targetMod = String(arg1).toLowerCase().trim();
    action = arg2 ? String(arg2).toLowerCase().trim() : 'view';

    const resolved = resolveModuleKeys(targetMod);
    moduleKey = resolved.moduleKey;
    submoduleKey = resolved.submoduleKey;
  } else {
    userPermissions = arg1;
    userRole = arg2;
    moduleKey = arg3;
    submoduleKey = arg4;
    action = arg5 || 'view';
  }

  // 1. Dashboard is static and always allowed for all users
  if (moduleKey === 'dashboard' || submoduleKey === 'dashboard' || submoduleKey === 'dashboard_overview') {
    return true;
  }

  if (!userRole) {
    const { role } = getLocalRoleAndPermissions();
    userRole = role;
  }
  userRole = userRole || 'EMPLOYEE';

  const normRole = String(userRole).toUpperCase().replace(/_/g, ' ');

  // 2. Super Admin & Admin always have full unrestricted permissions
  if (normRole === 'SUPER ADMIN' || normRole === 'SUPERADMIN' || normRole === 'ADMIN') {
    return true;
  }

  if (!userPermissions) {
    const { permissions } = getLocalRoleAndPermissions();
    userPermissions = permissions;
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
    return false;
  }

  // Check parent module permission entry ONLY if submodule key was not provided
  if (!submoduleKey && moduleKey && userPermissions[moduleKey] !== undefined && userPermissions[moduleKey] !== null) {
    const val = extractVal(userPermissions[moduleKey]);
    if (val !== undefined) return normalizeBoolean(val);
  }

  return false;
}

export function canView(userPermissions, userRole, moduleKey, submoduleKey = null) {
  if (typeof userPermissions === 'string') {
    return hasPermission(userPermissions, 'view');
  }
  return hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'view');
}

export function canCreate(userPermissions, userRole, moduleKey, submoduleKey = null) {
  if (typeof userPermissions === 'string') {
    return hasPermission(userPermissions, 'create');
  }
  return hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'create');
}

export function canEdit(userPermissions, userRole, moduleKey, submoduleKey = null) {
  if (typeof userPermissions === 'string') {
    return hasPermission(userPermissions, 'edit');
  }
  return hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'edit');
}

export function canDelete(userPermissions, userRole, moduleKey, submoduleKey = null) {
  if (typeof userPermissions === 'string') {
    return hasPermission(userPermissions, 'delete');
  }
  return hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'delete');
}

export function canApprove(userPermissions, userRole, moduleKey, submoduleKey = null) {
  if (typeof userPermissions === 'string') {
    return hasPermission(userPermissions, 'edit');
  }
  return hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'edit');
}

export function checkActionPermission(moduleName, actionName = 'CREATE', customMsg = null) {
  const allowed = hasPermission(moduleName, actionName);
  if (!allowed) {
    const act = String(actionName).toLowerCase();
    const msg = customMsg || `You do not have ${actionName.toUpperCase()} permission for this module.`;
    showPermissionDenied(msg);
    return false;
  }
  return true;
}

export function requireActionPermission(moduleKey, submoduleKey = null, action = 'create', callback = null, addToastFn = null, customMessage = null, userPermissions = null, userRole = null) {
  const allowed = hasPermission(userPermissions, userRole, moduleKey, submoduleKey, action);
  if (!allowed) {
    showPermissionDenied(customMessage);
    return false;
  }
  if (callback && typeof callback === 'function') {
    callback();
  }
  return true;
}

export function guardCreateAction(userPermissions, userRole, moduleKey, submoduleKey = null, addToastFn = null, customMessage = null) {
  const allowed = hasPermission(userPermissions, userRole, moduleKey, submoduleKey, 'create');
  if (!allowed) {
    showPermissionDenied(customMessage);
    return false;
  }
  return true;
}


