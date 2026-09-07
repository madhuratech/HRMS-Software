const db = require('../config/database');
const response = require('../utils/response');

const requireSalesAndMarketing = async (req, res, next) => {
  try {
    if (!req.user) {
      return response(res, false, 401, 'Unauthorized');
    }

    const role = String(req.user.role || '').toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || role === 'ADMIN') {
      return next();
    }

    const employeeId = req.user.id || req.user.employeeId;
    
    // Check department in database
    const sql = `
      SELECT d.dept_name 
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = ?
    `;

    db.query(sql, [employeeId], (err, results) => {
      if (err) {
        console.error("GPS Auth Error checking department:", err);
        return response(res, false, 500, 'Internal Server Error during GPS authorization');
      }

      if (!results || results.length === 0) {
        return response(res, false, 403, 'GPS field attendance is available only for the Sales & Marketing department.');
      }

      const deptName = results[0].dept_name;
      if (deptName === 'Sales & Marketing') {
        return next();
      }

      return response(res, false, 403, 'GPS field attendance is available only for the Sales & Marketing department.');
    });
  } catch (error) {
    console.error("GPS Auth Error:", error);
    return response(res, false, 500, 'Internal Server Error during GPS authorization');
  }
};

module.exports = {
  requireSalesAndMarketing
};
