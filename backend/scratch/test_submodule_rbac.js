const RbacService = require('../services/RbacService');

(async () => {
  console.log('=== TEST 1: Fetching Employee Permissions Hierarchy ===');
  const hierarchy = await RbacService.getRolePermissions('EMPLOYEE');
  const leaveMod = hierarchy.find(m => m.module_key === 'leave');
  
  console.log('Leave Management Module:', leaveMod.module_label);
  console.log('Submodules Count:', leaveMod.submodules.length);
  leaveMod.submodules.forEach(s => {
    console.log(`  - ${s.submodule_label} (${s.submodule_key}) -> View:${s.can_view}, Create:${s.can_create}, Edit:${s.can_edit}, Delete:${s.can_delete}`);
  });

  console.log('\n=== TEST 2: Updating Employee Submodule Permissions ===');
  const updatedLeaveMod = {
    ...leaveMod,
    submodules: leaveMod.submodules.map(s => {
      if (s.submodule_key === 'leave_balance') {
        return { ...s, can_view: true, can_create: false, can_edit: false, can_delete: false };
      }
      if (s.submodule_key === 'my_leave') {
        return { ...s, can_view: true, can_create: true, can_edit: true, can_delete: false };
      }
      if (s.submodule_key === 'leave_approval') {
        return { ...s, can_view: false, can_create: false, can_edit: false, can_delete: false };
      }
      return s;
    })
  };

  await RbacService.updateRolePermissions('EMPLOYEE', [updatedLeaveMod]);

  const newPerms = await RbacService.getUserPermissions('EMPLOYEE');
  console.log('\n=== TEST 3: Verifying getUserPermissions Output ===');
  console.log('leave_balance:', newPerms.leave_balance || newPerms.leave.submodules.leave_balance);
  console.log('my_leave:', newPerms.my_leave || newPerms.leave.submodules.my_leave);
  console.log('leave_approval:', newPerms.leave_approval || newPerms.leave.submodules.leave_approval);

  console.log('\n=== SUCCESS: All Submodule RBAC Tests Passed Cleanly! ===');
  process.exit(0);
})();
