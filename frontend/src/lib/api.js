const RENDER_BACKEND_URL = 'https://madhura-hrm.onrender.com';
const API_BASE = '/app';

export const getAuthToken = () => {
  const auth = localStorage.getItem('hrms_auth');
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      return parsed.token || 'mock_jwt_token';
    } catch (e) {
      return 'mock_jwt_token';
    }
  }
  return 'mock_jwt_token';
};

export const apiFetch = async (path, options = {}) => {
  let empHeaderId = '';
  let userRole = localStorage.getItem('userRole') || '';
  const auth = localStorage.getItem('hrms_auth');
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      const userObj = parsed.user || parsed;
      empHeaderId = userObj.id || userObj.emp_id || userObj.employee_id || '';
      if (!userRole) userRole = parsed.role || userObj.role || '';
    } catch (e) {}
  }

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Authorization': `Bearer ${getAuthToken()}`,
    ...(empHeaderId ? { 'x-employee-id': String(empHeaderId) } : {}),
    ...(userRole ? { 'x-user-role': String(userRole) } : {}),
    ...(options.headers || {})
  };
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await res.text();
    if (!text || !text.trim()) {
      return { success: res.ok, status: res.status };
    }
    return JSON.parse(text);
  } catch (e) {
    console.error(`apiFetch error for ${path}:`, e);
    return { success: false, message: e.message };
  }
};

export const formatDate = (value) => {
  if (!value) return 'TBD';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase();
};