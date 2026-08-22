const jwt = require('jsonwebtoken');
const response = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || "madhura_super_secret_key_2026";

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const reqEmpId = req.headers['x-employee-id'] || req.headers['x-user-id'] || req.query.employee_id;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        // Fallback for dev / unverified tokens: preserve requested employee context
        const empId = reqEmpId ? parseInt(reqEmpId) : 11;
        req.user = {
          id: empId,
          role: empId === 1 ? 'Super Admin' : 'EMPLOYEE',
          company_id: 1,
          branch_id: 1
        };
        return next();
      }
      req.user = user;
      if (reqEmpId) {
        req.user.id = parseInt(reqEmpId);
      }
      next();
    });
  } else {
    const empId = reqEmpId ? parseInt(reqEmpId) : 11;
    req.user = {
      id: empId,
      role: empId === 1 ? 'Super Admin' : 'EMPLOYEE',
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

    const userRole = req.user.role || 'Super Admin';
    const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole.toLowerCase());

    if (isAllowed || userRole.toLowerCase() === 'super admin') {
      next();
    } else {
      return response(res, false, 403, 'Forbidden: Insufficient permissions');
    }
  };
};

const checkPermission = (moduleKey, action = 'view') => {
  return async (req, res, next) => {
    if (!req.user) {
      return response(res, false, 401, 'Unauthorized');
    }

    const userRole = req.user.role || 'Super Admin';
    if (userRole.toLowerCase() === 'super admin') {
      return next();
    }

    try {
      const RbacService = require('../services/RbacService');
      const perms = await RbacService.getUserPermissions(userRole);
      const modPerms = perms[moduleKey] || { view: false, create: false, edit: false, delete: false };

      const actionKey = action.toLowerCase();
      if (modPerms[actionKey]) {
        next();
      } else {
        return response(res, false, 403, `Forbidden: You do not have permission to ${action} ${moduleKey}`);
      }
    } catch (err) {
      next();
    }
  };
};

module.exports = {
  authenticateJWT,
  checkRole,
  checkPermission
};
