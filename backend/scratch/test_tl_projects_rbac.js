const RbacService = require('../services/RbacService');
const { checkPermission } = require('../middlewares/auth');

(async () => {
  console.log('==================================================');
  console.log('TESTING TEAM LEADER PROJECTS SUBMODULE PERMISSIONS');
  console.log('==================================================\n');

  const roleKey = 'TEAM_LEADER';
  const hierarchy = await RbacService.getRolePermissions(roleKey);
  const projMod = hierarchy.find(m => m.module_key === 'projects' || m.module_key === 'projects_tasks');

  if (projMod) {
    console.log('Found Projects Module:', projMod.module_label);
    const updatedMod = {
      ...projMod,
      can_view: true,
      can_create: true,
      can_edit: false,
      can_delete: false,
      submodules: projMod.submodules.map(s => {
        if (s.submodule_key === 'projects_list') {
          return { ...s, can_view: true, can_create: true, can_edit: false, can_delete: false };
        }
        return s;
      })
    };
    await RbacService.updateRolePermissions(roleKey, [updatedMod]);
  }

  const perms = await RbacService.getUserPermissions(roleKey);
  console.log('getUserPermissions(TEAM_LEADER).projects_list:', perms.projects_list);
  console.log('getUserPermissions(TEAM_LEADER).projects_tasks:', perms.projects_tasks);

  // Test middleware execution
  const req = { user: { id: 22, role: 'TEAM_LEADER' } };
  const mockRes = (action) => ({
    status: (code) => ({
      json: (data) => console.log(`[MIDDLEWARE RESULT] Action: ${action} -> Status: ${code}`, data)
    })
  });

  console.log('\n--- TESTING MIDDLEWARE WITH (module: projects_tasks, submodule: projects_list) ---');
  
  // Test View
  const viewMw = checkPermission('projects_tasks', 'projects_list', 'view');
  await viewMw(req, mockRes('view'), () => console.log('[MIDDLEWARE RESULT] Action: view -> 200 OK (Allowed)'));

  // Test Create
  const createMw = checkPermission('projects_tasks', 'projects_list', 'create');
  await createMw(req, mockRes('create'), () => console.log('[MIDDLEWARE RESULT] Action: create -> 200 OK (Allowed)'));

  // Test Edit
  const editMw = checkPermission('projects_tasks', 'projects_list', 'edit');
  await editMw(req, mockRes('edit'), () => console.log('[MIDDLEWARE RESULT] Action: edit -> 200 OK (Allowed)'));

  // Test Delete
  const deleteMw = checkPermission('projects_tasks', 'projects_list', 'delete');
  await deleteMw(req, mockRes('delete'), () => console.log('[MIDDLEWARE RESULT] Action: delete -> 200 OK (Allowed)'));

  console.log('\n==================================================');
  console.log('TEAM LEADER RBAC TEST COMPLETE!');
  console.log('==================================================');
  process.exit(0);
})();
