const validateKpi = (data) => {
  const errors = [];
  if (!data.kpi_name) errors.push('KPI Name is required');
  if (!data.department_id || isNaN(data.department_id)) errors.push('Department is required');
  if (!data.target_value) errors.push('Target Value is required');
  return { error: errors.length > 0 ? { details: errors.map(m => ({ message: m })) } : null };
};

const validateKra = (data) => {
  const errors = [];
  if (!data.kra_title) errors.push('KRA Title is required');
  if (!data.department_id || isNaN(data.department_id)) errors.push('Department is required');
  if (!data.role_id) errors.push('Role is required');
  return { error: errors.length > 0 ? { details: errors.map(m => ({ message: m })) } : null };
};

const validateAppraisal = (data) => {
  const errors = [];
  if (!data.employee_id || isNaN(data.employee_id)) errors.push('Employee is required');
  if (!data.current_salary || isNaN(data.current_salary)) errors.push('Current Salary is required');
  if (!data.proposed_salary || isNaN(data.proposed_salary)) errors.push('Proposed Salary is required');
  if (!data.effective_date) errors.push('Effective Date is required');
  return { error: errors.length > 0 ? { details: errors.map(m => ({ message: m })) } : null };
};

const validateReview = (data) => {
  const errors = [];
  if (!data.employee_id || isNaN(data.employee_id)) errors.push('Employee is required');
  if (!data.review_period) errors.push('Review Period is required');
  if (!data.reviewer_id) errors.push('Reviewer is required');
  if (!data.type) errors.push('Review Type is required');
  return { error: errors.length > 0 ? { details: errors.map(m => ({ message: m })) } : null };
};

const validateFeedback = (data) => {
  const errors = [];
  if (!data.employee_id || isNaN(data.employee_id)) errors.push('Recipient Employee is required');
  if (!data.department_id || isNaN(data.department_id)) errors.push('Department is required');
  if (!data.comments) errors.push('Comments/Feedback text is required');
  return { error: errors.length > 0 ? { details: errors.map(m => ({ message: m })) } : null };
};

module.exports = {
  validateKpi,
  validateKra,
  validateAppraisal,
  validateReview,
  validateFeedback
};
