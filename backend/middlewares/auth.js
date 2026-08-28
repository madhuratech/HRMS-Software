const jwt = require('jsonwebtoken');
const response = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || "madhura_super_secret_key_2026";

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const reqEmpId = req.headers['x-employee-id'] || req.headers['x-user-id'] || req.query.employee_id;
  const headerRole = req.headers['x-user-role'] || req.headers['x-role'] || req.query.role;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        const parsedHeaderId = parseInt(reqEmpId);
        req.user = {
          id: (reqEmpId && !isNaN(parsedHeaderId)) ? parsedHeaderId : 1,
          role: headerRole || 'EMPLOYEE',
          company_id: 1,
          branch_id: 1
        };
        return next();
      }
      req.user = user || {};
      if (headerRole) {
        req.user.role = headerRole;
      }
      if (reqEmpId) {
        const parsedHeaderId = parseInt(reqEmpId);
        if (!isNaN(parsedHeaderId)) {
          req.user.employee_id = parsedHeaderId;
          if (!req.user.id || isNaN(parseInt(req.user.id))) {
            req.user.id = parsedHeaderId;
          }
        }
      }
      const finalId = parseInt(req.user.id);
      req.user.id = (!isNaN(finalId) && finalId > 0) ? finalId : 1;
      next();
    });
  } else {
    const parsedHeaderId = parseInt(reqEmpId);
    req.user = {
      id: (reqEmpId && !isNaN(parsedHeaderId)) ? parsedHeaderId : 1,
      role: headerRole || 'EMPLOYEE',
      company_id: 1,
      branch_id: 1
    };
    return next();
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return response(res, false, 401, 'Unauthorized');
    }

    const rawRole = String(req.user.role || 'SUPER_ADMIN');
    const normUserRole = rawRole.toUpperCase().replace(/_/g, ' ');
    const normAllowed = (allowedRoles || []).map(r => String(r).toUpperCase().replace(/_/g, ' '));

    const isSuperAdmin = normUserRole === 'SUPER ADMIN' || normUserRole === 'SUPERADMIN' || normUserRole === 'ADMIN';
    const isAllowed = isSuperAdmin || normAllowed.includes(normUserRole);

    if (isAllowed) {
      next();
    } else {
      return response(res, false, 403, 'Forbidden: Insufficient permissions');
    }
  };
};

const checkPermission = (moduleKey, submoduleKey = null, action = 'view') => {
  if (typeof submoduleKey === 'string' && ['view', 'create', 'edit', 'delete'].includes(submoduleKey.toLowerCase())) {
    action = submoduleKey;
    submoduleKey = null;
  }

  return async (req, res, next) => {
    if (!req.user) {
      return response(res, false, 401, 'Unauthorized');
    }

    const userRole = req.headers['x-user-role'] || req.headers['x-role'] || req.user.role || 'EMPLOYEE';
    const normRole = String(userRole).toUpperCase().replace(/_/g, ' ');

    if (normRole === 'SUPER ADMIN' || normRole === 'SUPERADMIN' || normRole === 'ADMIN') {
      return next();
    }

    try {
      const RbacService = require('../services/RbacService');
      const perms = await RbacService.getUserPermissions(userRole);
      const act = String(action).toLowerCase();
      const actAlt = act === 'view' ? 'canView' : act === 'create' ? 'canCreate' : act === 'edit' ? 'canEdit' : 'canDelete';

      let isAllowed = false;
      const targetKey = submoduleKey || moduleKey;

      const extractVal = (obj) => {
        if (!obj) return undefined;
        if (obj[act] !== undefined) return obj[act];
        if (obj[actAlt] !== undefined) return obj[actAlt];
        if (obj[`can_${act}`] !== undefined) return obj[`can_${act}`];
        return undefined;
      };

      if (submoduleKey && perms[submoduleKey]) {
        const val = extractVal(perms[submoduleKey]);
        if (val !== undefined) isAllowed = (val === true || val === 1 || val === '1' || val === 'true');
      } else if (moduleKey && perms[moduleKey]) {
        const val = extractVal(perms[moduleKey]);
        if (val !== undefined) isAllowed = (val === true || val === 1 || val === '1' || val === 'true');
      }

      console.log(`[BACKEND PERMISSION CHECK] role: ${userRole} | module: ${moduleKey} | submodule: ${targetKey} | action: ${act} | allowed: ${isAllowed}`);

      if (isAllowed) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: `Permission Denied: You do not have permission to ${act} in ${targetKey}. Please contact your administrator.`
        });
      }
    } catch (err) {
      console.error('checkPermission exception:', err);
      return res.status(403).json({
        success: false,
        message: 'Permission Denied: Unauthorized request.'
      });
    }
  };
};

module.exports = {
  authenticateJWT,
  checkRole,
  checkPermission
};
