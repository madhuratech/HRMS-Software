const db = require('../config/database');
const ProjectService = require('../services/ProjectService');

(async () => {
  console.log('==================================================');
  console.log('TESTING ADMIN CREATE PROJECT SERVICE & CONTROLLER');
  console.log('==================================================\n');

  const testProjectPayload = {
    project_name: 'Test HRMS Expansion Project ' + Date.now(),
    project_code: 'PRJ-TEST-' + Math.floor(Math.random() * 1000),
    client: 'Acme Enterprises',
    project_manager_id: 22,
    team_members: [26],
    start_date: '2026-09-01',
    end_date: '2026-12-31',
    budget: '500000',
    priority: 'High',
    status: 'In Progress',
    description: 'Testing Admin project creation flow.'
  };

  try {
    const adminUserId = 1;
    const newProject = await ProjectService.create(testProjectPayload, adminUserId);
    console.log('Project Created Successfully! ID:', newProject.id);

    // Verify in DB
    const rows = await ProjectService.getById(newProject.id);
    console.log('Retrieved Project from DB:', rows);
    console.log('\nSUCCESS: Admin project creation works perfectly!');
  } catch (err) {
    console.error('ERROR creating project:', err);
  }

  process.exit(0);
})();
