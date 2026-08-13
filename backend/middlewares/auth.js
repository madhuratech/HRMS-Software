const jwt = require('jsonwebtoken');
const response = require('../utils/response');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Authorization: Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret', (err, user) => {
      if (err) {
        if (process.env.NODE_ENV === 'development') {
          req.user = {
            id: 1,
            role: 'Super Admin',
            company_id: 1,
            branch_id: 1,
            username: 'admin'
          };
          return next();
        }
        return response(res, false, 403, 'Forbidden: Invalid token');
      }
      req.user = user;
      next();
    });
  } else {
    // If JWT_SECRET is not yet active or we need to allow dev access, let's look for a dev header or query param.
    // For robust production, require auth header:
    // To bypass/simulate JWT for initial test if login is local:
    if (process.env.NODE_ENV === 'development') {
      // Simulate user context for ease of development when token is not present
      req.user = {
        id: 1,
        role: 'Super Admin',
        company_id: 1,
        branch_id: 1,
        username: 'admin'
      };
      return next();
    }
    return response(res, false, 401, 'Unauthorized: Missing token');
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return response(res, false, 401, 'Unauthorized');
    }

    const userRole = req.user.role; // e.g., 'Super Admin', 'HR Admin', etc.
    const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole.toLowerCase());

    if (isAllowed) {
      next();
    } else {
      return response(res, false, 403, 'Forbidden: Insufficient permissions');
    }
  };
};

module.exports = {
  authenticateJWT,
  checkRole
};
