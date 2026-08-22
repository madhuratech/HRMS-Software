const validatePromotion = (data) => {
  const errors = [];
  if (!data.employee_id || isNaN(data.employee_id)) errors.push('Employee is required');
  if (!data.promotion_date) errors.push('Promotion Date is required');
  if (!data.effective_date) errors.push('Effective Date is required');
  if (!data.promoted_designation) errors.push('Promoted Designation is required');
  return { error: errors.length > 0 ? { details: errors.map(m => ({ message: m })) } : null };
};

module.exports = { validatePromotion };
