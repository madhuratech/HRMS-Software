const RENDER_BACKEND_URL = 'https://madhura-hrm.onrender.com';
const API_BASE = '/app';

// ─── Native Fetch Reference & Global Window Fetch Interception ────────────────
const nativeFetch = (typeof window !== 'undefined' && window.fetch) ? window.fetch.bind(window) : fetch;

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

export const getAuthHeaders = (extraHeaders = {}) => {
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
  return {
    'Authorization': `Bearer ${getAuthToken()}`,
    ...(empHeaderId ? { 'x-employee-id': String(empHeaderId) } : {}),
    ...(userRole ? { 'x-user-role': String(userRole) } : {}),
    ...extraHeaders
  };
};

/**
 * Universal Response Formatter for Demo Store
 * Ensures that whether a component expects an Array (e.g. Array.isArray(res)),
 * or an Object (e.g. res.data, res.success, res.total), it works seamlessly!
 */
export const toDemoResponse = (data, extra = {}) => {
  const isArray = Array.isArray(data);
  const dataPayload = isArray ? data : (data !== undefined ? data : []);
  if (isArray) {
    const arr = [...dataPayload];
    return Object.assign(arr, {
      success: true,
      data: dataPayload,
      total: dataPayload.length,
      items: dataPayload,
      records: dataPayload,
      ...extra
    });
  }
  return {
    success: true,
    data: dataPayload,
    total: 0,
    items: dataPayload,
    records: dataPayload,
    ...extra
  };
};

export const apiFetch = async (path, options = {}) => {
  let targetPath = path || '';
  if (targetPath.startsWith('/app/')) {
    targetPath = targetPath.substring(4);
  } else if (targetPath.startsWith('/api/')) {
    targetPath = targetPath.substring(4);
  }
  if (!targetPath.startsWith('/')) {
    targetPath = '/' + targetPath;
  }

  const isFormData = options.body instanceof FormData;
  const headers = getAuthHeaders({
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  });

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, offline: true, message: 'Internet connection unavailable' };
  }

  // Safe Interception: If customer is in 3-Hour Demo session, serve dummy store for operational endpoints
  // This guarantees the real database is NEVER touched by demo actions
  const isDemoActive = (() => {
    try {
      if (localStorage.getItem('hrms_is_demo_sandbox') === 'true') {
        const meta = JSON.parse(localStorage.getItem('hrms_3hr_demo_meta') || '{}');
        if (meta && meta.expiresAt && Date.now() >= meta.expiresAt) {
          return false;
        }
        return true;
      }
      const meta = JSON.parse(localStorage.getItem('hrms_3hr_demo_meta') || '{}');
      if (!meta || !meta.isActive || !meta.is3HourDemo) return false;
      if (meta.expiresAt && Date.now() >= meta.expiresAt) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  })();

  // ══════════════════════════════════════════════════════════════════════════
  // Complete 3-Hour Demo Interception for ALL Modules & Crud Operations
  // Guaranteed: Production MySQL DB is NEVER touched or displayed!
  // ══════════════════════════════════════════════════════════════════════════
  if (isDemoActive && !targetPath.startsWith('/trial') && targetPath !== '/auth/login') {
    try {
      const rawDb = localStorage.getItem('hrms_3hr_demo_dummy_db');
      let dummyDb = rawDb ? JSON.parse(rawDb) : null;
      const meta = JSON.parse(localStorage.getItem('hrms_3hr_demo_meta') || '{}');
      if (!dummyDb || !dummyDb.initialized) {
        const { initializeDummyDatabase } = await import('./demoDummyStore');
        dummyDb = initializeDummyDatabase(meta.company, meta.customerName);
      }

      if (dummyDb) {
        // Parse request body if available
        let bodyPayload = {};
        try {
          if (typeof options.body === 'string') {
            bodyPayload = JSON.parse(options.body);
          } else if (options.body && typeof options.body === 'object') {
            bodyPayload = options.body;
          }
        } catch (e) {}

        // 1. Current Session User (/auth/me)
        if (targetPath.includes('/auth/me')) {
          return {
            success: true,
            user: {
              id: 1,
              name: meta.customerName || 'Customer Admin',
              email: meta.email || 'admin@company.com',
              role: 'SUPER_ADMIN',
              company: meta.company || 'Customer Organization',
              emp_id: 'SUPER ADMIN',
              employeeCode: 'SUPER ADMIN',
              designation: 'Managing Director & Super Admin'
            },
            role: 'SUPER_ADMIN'
          };
        }

        // 2. Dashboard Stats Interception (CRITICAL: prevents showing real MySQL data!)
        if (targetPath.includes('/dashboard')) {
          const { getDummyDashboardStats } = await import('./demoDummyStore');
          return getDummyDashboardStats();
        }

        // 3. Projects Meta & Dashboard & List (CRITICAL for /projects/list & /projects/dashboard!)
        if (targetPath.includes('/projects/meta')) {
          const metaEmployees = (dummyDb.employees || []).map(e => ({
            id: e.id,
            name: e.name,
            department_name: e.department,
            designation_name: e.designation,
            role_key: e.role === 'SUPER_ADMIN' ? 'super_admin' : 'employee',
            role_name: e.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Employee'
          }));
          const metaDepartments = (dummyDb.departments || []).map(d => ({ id: d.id, name: d.name }));
          return {
            success: true,
            data: {
              employees: metaEmployees,
              departments: metaDepartments,
              projects: dummyDb.projects || []
            }
          };
        }

        if (targetPath.includes('/projects/dashboard')) {
          const projs = dummyDb.projects || [];
          return {
            success: true,
            data: {
              totalProjects: projs.length,
              completedProjects: projs.filter(p => p.status === 'Completed').length,
              inProgressProjects: projs.filter(p => p.status === 'In Progress').length,
              onHoldProjects: 0,
              statusPie: projs.length ? [
                { name: 'In Progress', value: projs.filter(p => p.status === 'In Progress').length, color: '#3B82F6' },
                { name: 'Completed', value: projs.filter(p => p.status === 'Completed').length, color: '#10B981' }
              ] : [],
              monthlyTrend: [],
              topProjects: projs.slice(0, 3).map(p => ({
                id: p.id,
                name: p.title || p.project_name || 'Project',
                progress: p.progress || 0,
                budget: p.budget || 0,
                status: p.status || 'In Progress'
              })),
              recentProjects: projs.slice(0, 5).map(p => ({
                id: p.id,
                name: p.title || p.project_name || 'Project',
                manager: meta.customerName || 'Admin',
                start: p.start_date || '',
                end: p.end_date || '',
                status: p.status || 'In Progress',
                priority: 'High'
              }))
            }
          };
        }

        if (targetPath.includes('/projects')) {
          if (options.method === 'POST') {
            const { addDummyProject } = await import('./demoDummyStore');
            const proj = addDummyProject(bodyPayload);
            return { success: true, message: 'Project created in demo database', project: proj, data: proj };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyProject } = await import('./demoDummyStore');
            const updated = updateDummyProject(id, bodyPayload);
            return { success: true, message: 'Project updated in demo database', project: updated, data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyProject } = await import('./demoDummyStore');
            deleteDummyProject(id);
            return { success: true, message: 'Project removed from demo database' };
          }
          const formattedProjects = (dummyDb.projects || []).map(p => ({
            id: p.id,
            project_name: p.title || p.project_name || 'Enterprise Project',
            project_code: p.project_code || `PRJ-${String(p.id).padStart(3, '0')}`,
            client: p.client || p.client_name || 'Enterprise Client',
            client_name: p.client || p.client_name || 'Enterprise Client',
            status: p.status || 'In Progress',
            budget: p.budget || 150000,
            progress: p.progress || 45,
            start_date: '2026-09-01',
            end_date: '2026-12-31',
            priority: 'High',
            description: 'Managed in 3-Hour Demo Workspace',
            team_members: []
          }));
          return {
            success: true,
            data: {
              projects: formattedProjects,
              total: formattedProjects.length
            },
            projects: formattedProjects,
            total: formattedProjects.length
          };
        }

        // 4. Tasks & Sprint Board & Milestones & Timesheets & Project Team
        if (targetPath.includes('/tasks/dashboard')) {
          const tasks = dummyDb.tasks || [];
          return {
            success: true,
            data: {
              totalTasks: tasks.length,
              todo: tasks.filter(t => t.status === 'To Do' || t.status === 'Backlog').length,
              inProgress: tasks.filter(t => t.status === 'In Progress').length,
              review: tasks.filter(t => t.status === 'Review' || t.status === 'Testing').length,
              completed: tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length
            }
          };
        }

        if (targetPath.includes('/tasks')) {
          if (options.method === 'POST') {
            const { addDummyTask } = await import('./demoDummyStore');
            const newTask = addDummyTask(bodyPayload);
            return { success: true, message: 'Task created in demo database', task: newTask, data: newTask };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyTask } = await import('./demoDummyStore');
            const updated = updateDummyTask(id, bodyPayload);
            return { success: true, message: 'Task updated in demo database', task: updated, data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyTask } = await import('./demoDummyStore');
            deleteDummyTask(id);
            return { success: true, message: 'Task deleted from demo database' };
          }
          const taskList = dummyDb.tasks || [];
          return {
            success: true,
            data: {
              tasks: taskList,
              total: taskList.length
            },
            tasks: taskList,
            total: taskList.length
          };
        }

        if (targetPath.includes('/sprints')) {
          return {
            success: true,
            data: {
              sprints: [],
              tasks: dummyDb.tasks || []
            }
          };
        }

        if (targetPath.includes('/milestones')) {
          if (targetPath.includes('/dashboard')) {
            return {
              success: true,
              data: {
                totalMilestones: 0,
                completed: 0,
                inProgress: 0,
                overdue: 0
              }
            };
          }
          return toDemoResponse([]);
        }

        if (targetPath.includes('/timesheets')) {
          if (targetPath.includes('/summary')) {
            return {
              success: true,
              data: {
                totalHours: 0,
                billableHours: 0,
                nonBillableHours: 0,
                approvedHours: 0
              }
            };
          }
          return toDemoResponse([]);
        }

        if (targetPath.includes('/project-team')) {
          if (targetPath.includes('/meta')) {
            return {
              success: true,
              data: {
                employees: dummyDb.employees || [],
                projects: dummyDb.projects || []
              }
            };
          }
          return toDemoResponse([]);
        }

        // 5. Clients Active List & Clients CRUD
        if (targetPath.includes('/clients/active/list')) {
          return {
            success: true,
            data: (dummyDb.clients || []).map(c => ({
              id: c.id,
              name: c.name || c.client_name,
              company_name: c.name || c.client_name,
              client_name: c.name || c.client_name
            }))
          };
        }

        if (targetPath.includes('/clients')) {
          if (options.method === 'POST') {
            const { addDummyClient } = await import('./demoDummyStore');
            const cl = addDummyClient(bodyPayload);
            return { success: true, message: 'Client created in demo database', client: cl, data: cl };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyClient } = await import('./demoDummyStore');
            const updated = updateDummyClient(id, bodyPayload);
            return { success: true, message: 'Client updated in demo database', client: updated, data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyClient } = await import('./demoDummyStore');
            deleteDummyClient(id);
            return { success: true, message: 'Client deleted' };
          }
          if (targetPath.includes('/projects')) {
            return { success: true, data: dummyDb.projects || [] };
          }
          if (targetPath.includes('/activity')) {
            return { success: true, data: [] };
          }
          const formattedClients = (dummyDb.clients || []).map(c => ({
            id: c.id,
            client_name: c.name || c.client_name,
            company_name: c.name || c.client_name,
            industry: c.industry || 'Technology',
            client_type: 'Enterprise',
            status: c.status || 'Active',
            email: 'contact@' + (c.name || 'client').toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
            phone: '+91 98765 43210'
          }));
          return {
            success: true,
            data: {
              clients: formattedClients,
              total: formattedClients.length,
              stats: {
                total: formattedClients.length,
                active: formattedClients.filter(c => c.status === 'Active').length,
                inactive: 0
              },
              industries: ['Technology', 'Logistics', 'Healthcare', 'Finance']
            },
            clients: formattedClients,
            total: formattedClients.length
          };
        }

        // 6. Employees (GET, POST, PUT, DELETE)
        if (targetPath.includes('/employees')) {
          if (options.method === 'POST') {
            const { addDummyEmployee } = await import('./demoDummyStore');
            const newEmp = addDummyEmployee(bodyPayload);
            return { success: true, message: 'Employee added to demo database successfully', employee: newEmp, data: newEmp };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyEmployee } = await import('./demoDummyStore');
            const updated = updateDummyEmployee(id, bodyPayload);
            return { success: true, message: 'Employee updated successfully', employee: updated, data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyEmployee } = await import('./demoDummyStore');
            deleteDummyEmployee(id);
            return { success: true, message: 'Employee removed from demo database' };
          }
          const empList = (dummyDb.employees || []).map(e => ({
            id: e.id,
            name: e.name,
            email: e.email,
            phone: e.phone,
            status: e.status || 'Active',
            dept_name: e.department,
            department: e.department,
            department_name: e.department,
            role_name: e.designation,
            designation: e.designation,
            designation_name: e.designation,
            salary: e.salary,
            ctc: e.salary,
            join_date: e.join_date,
            emp_id: e.emp_id,
            employeeCode: e.emp_id,
            role: e.role,
            avatar: e.avatar,
            profile_photo: e.avatar
          }));
          return empList;
        }

        // 7. Organization (Departments, Designations, Profile, Shifts, Teams, Holidays)
        if (targetPath.includes('/organization/departments') || targetPath.includes('/departments')) {
          if (options.method === 'POST') {
            const { addDummyDepartment } = await import('./demoDummyStore');
            const dept = addDummyDepartment(bodyPayload);
            return { success: true, message: 'Department created in demo database', department: dept, data: dept };
          }
          const depts = (dummyDb.departments || []).map(d => ({
            id: d.id,
            name: d.name,
            dept_name: d.name,
            head: d.head || 'Super Admin',
            employees_count: d.employees_count || 1
          }));
          return toDemoResponse(depts, { departments: depts });
        }
        if (targetPath.includes('/organization/designations') || targetPath.includes('/designations')) {
          if (options.method === 'POST') {
            const { addDummyDesignation } = await import('./demoDummyStore');
            const desig = addDummyDesignation(bodyPayload);
            return { success: true, message: 'Designation created in demo database', designation: desig, data: desig };
          }
          const desigs = (dummyDb.designations || []).map(d => ({
            id: d.id,
            name: d.name,
            role_name: d.name,
            role_code: `DES-${d.id}`,
            department: d.department
          }));
          return toDemoResponse(desigs, { designations: desigs });
        }
        if (targetPath.includes('/organization/teams') || targetPath.includes('/teams')) {
          return toDemoResponse([]);
        }
        if (targetPath.includes('/organization/shifts') || targetPath.includes('/shifts')) {
          const shifts = [
            { id: 1, name: 'General Shift', start_time: '09:00:00', end_time: '18:00:00', status: 'Active' }
          ];
          return toDemoResponse(shifts);
        }
        if (targetPath.includes('/organization/holidays') || targetPath.includes('/holiday-calendar') || targetPath.includes('/leaves/holidays')) {
          return toDemoResponse([]);
        }
        if (targetPath.includes('/company-profile')) {
          if (options.method === 'POST' || options.method === 'PUT') {
            const { updateDummyCompanyProfile } = await import('./demoDummyStore');
            const comp = updateDummyCompanyProfile(bodyPayload);
            return { success: true, message: 'Company profile updated in demo database', company: comp, data: comp };
          }
          return { success: true, company: dummyDb.company || {}, data: dummyDb.company || {} };
        }

        // 8. Attendance (Daily, Punch Locations, Regularization, Overtime, Late Arrival, GPS, Recent)
        if (targetPath.includes('/attendance')) {
          if (targetPath.includes('/regularization')) {
            if (options.method === 'POST') {
              const { addDummyRegularization } = await import('./demoDummyStore');
              const reg = addDummyRegularization(bodyPayload);
              return { success: true, message: 'Regularization request submitted', data: reg, regularization: reg };
            }
            if (options.method === 'PUT') {
              const id = targetPath.split('/').filter(Boolean).slice(-2, -1)[0] || targetPath.split('/').filter(Boolean).pop();
              const { updateDummyRegularization } = await import('./demoDummyStore');
              const updated = updateDummyRegularization(id, bodyPayload);
              return { success: true, message: 'Regularization updated', data: updated, regularization: updated };
            }
            return toDemoResponse(dummyDb.regularizations || []);
          }
          if (targetPath.includes('/overtime')) {
            if (options.method === 'POST') {
              const { addDummyOvertime } = await import('./demoDummyStore');
              const ot = addDummyOvertime(bodyPayload);
              return { success: true, message: 'Overtime request submitted', data: ot };
            }
            if (options.method === 'PUT') {
              const id = targetPath.split('/').filter(Boolean).pop();
              const { updateDummyOvertime } = await import('./demoDummyStore');
              const updated = updateDummyOvertime(id, bodyPayload);
              return { success: true, message: 'Overtime status updated', data: updated };
            }
            return toDemoResponse(dummyDb.overtime || []);
          }
          if (targetPath.includes('/late-arrival') || targetPath.includes('/late')) {
            if (options.method === 'POST') {
              const { addDummyLateArrival } = await import('./demoDummyStore');
              const la = addDummyLateArrival(bodyPayload);
              return { success: true, message: 'Late arrival recorded', data: la };
            }
            return toDemoResponse(dummyDb.lateArrival || []);
          }
          if (options.method === 'POST') {
            const { addDummyAttendance } = await import('./demoDummyStore');
            const att = addDummyAttendance(bodyPayload);
            return { success: true, message: 'Attendance recorded in demo database', record: att, data: att };
          }
          if (targetPath.includes('/daily')) {
            const daily = (dummyDb.attendanceToday || []).map(a => ({
              id: a.id,
              db_id: a.id,
              employee_id: a.id,
              name: a.name,
              emp_name: a.name,
              punch_in: a.punchIn,
              punch_out: a.punchOut,
              status: a.status,
              punch_type: a.type,
              location: a.location
            }));
            return {
              success: true,
              data: daily,
              records: daily,
              kpis: {
                totalEmployees: (dummyDb.employees || []).length,
                presentCount: (dummyDb.attendanceToday || []).filter(a => a.status === 'Present').length,
                lateCount: (dummyDb.attendanceToday || []).filter(a => a.status === 'Late').length,
                absentCount: 0,
                halfDayCount: 0
              }
            };
          }
          if (targetPath.includes('/punch-locations')) {
            if (options.method === 'POST') {
              const { addDummyPunchLocation, getDummyDb } = await import('./demoDummyStore');
              const loc = addDummyPunchLocation(bodyPayload);
              const freshDb = getDummyDb();
              return { success: true, message: 'Punch location added successfully', location: loc, locations: freshDb.punchLocations || [loc], data: loc };
            }
            if (options.method === 'PUT') {
              const cleanId = targetPath.split('?')[0].split('/').filter(Boolean).pop();
              const { updateDummyPunchLocation } = await import('./demoDummyStore');
              const updated = updateDummyPunchLocation(cleanId, bodyPayload);
              return { success: true, message: 'Punch location updated successfully', location: updated, data: updated };
            }
            if (options.method === 'DELETE') {
              const cleanId = targetPath.split('?')[0].split('/').filter(Boolean).pop();
              const { deleteDummyPunchLocation } = await import('./demoDummyStore');
              deleteDummyPunchLocation(cleanId);
              return { success: true, message: 'Punch location removed successfully' };
            }

            const { getDummyDb, saveDummyDb } = await import('./demoDummyStore');
            const freshDb = getDummyDb();
            let locList = freshDb.punchLocations;

            // Auto-repair if punchLocations was missing/empty in an older session
            if (!locList || !Array.isArray(locList) || locList.length === 0) {
              locList = [
                {
                  id: 1,
                  name: 'HQ Main Campus Geofence',
                  branch: 'Headquarters',
                  latitude: 12.9716,
                  longitude: 77.5946,
                  radius: 100,
                  address: 'MG Road, Indiranagar, Bengaluru, Karnataka 560038',
                  description: 'Main corporate headquarters office geofence',
                  status: 'Active'
                },
                {
                  id: 2,
                  name: 'Tech Park Branch Geofence',
                  branch: 'North Office',
                  latitude: 12.9352,
                  longitude: 77.6245,
                  radius: 150,
                  address: 'Koramangala 5th Block, Bengaluru, Karnataka 560095',
                  description: 'R&D tech park center',
                  status: 'Active'
                }
              ];
              freshDb.punchLocations = locList;
              saveDummyDb(freshDb);
            }

            // Parse URL search params for filtering
            let filtered = [...locList];
            if (targetPath.includes('?')) {
              try {
                const searchParams = new URLSearchParams(targetPath.split('?')[1]);
                const q = searchParams.get('search');
                const st = searchParams.get('status');
                if (q && q.trim()) {
                  const query = q.trim().toLowerCase();
                  filtered = filtered.filter(l =>
                    (l.name && l.name.toLowerCase().includes(query)) ||
                    (l.branch && l.branch.toLowerCase().includes(query)) ||
                    (l.address && l.address.toLowerCase().includes(query))
                  );
                }
                if (st && st.trim()) {
                  filtered = filtered.filter(l => l.status === st.trim());
                }
              } catch (e) {}
            }

            return {
              success: true,
              locations: filtered,
              total: filtered.length,
              data: filtered
            };
          }
          if (targetPath.includes('/today-status') || targetPath.includes('/recent')) {
            return {
              success: true,
              data: {
                status: 'Not Punched',
                punchIn: '--',
                duration: '0h 0m',
                recent: dummyDb.attendanceToday || []
              }
            };
          }
          return { success: true, records: dummyDb.attendanceToday || [], data: dummyDb.attendanceToday || [] };
        }

        // 9. Leaves & Approvals
        if (targetPath.includes('/leaves') || targetPath.includes('/leave')) {
          if (targetPath.includes('/comp-off')) {
            if (options.method === 'POST') {
              const { addDummyCompOff } = await import('./demoDummyStore');
              const co = addDummyCompOff(bodyPayload);
              return { success: true, message: 'Comp-off request submitted', data: co };
            }
            return toDemoResponse(dummyDb.compOff || []);
          }
          if (options.method === 'POST') {
            const { addDummyLeave } = await import('./demoDummyStore');
            const lv = addDummyLeave(bodyPayload);
            return { success: true, message: 'Leave application submitted in demo database', leave: lv, data: lv };
          }
          if (targetPath.includes('/dashboard-stats')) {
            return {
              success: true,
              kpis: {
                totalEmployees: (dummyDb.employees || []).length,
                onLeaveToday: 0,
                leavesTaken: (dummyDb.leaves || []).filter(l => l.status === 'Approved').length,
                pendingApprovals: (dummyDb.leaves || []).filter(l => l.status === 'Pending Approval').length,
                leaveEncashment: '₹0.00'
              },
              onLeaveToday: [],
              leaveByDepartment: [],
              leaveDistribution: [],
              data: {
                totalLeaves: (dummyDb.leaves || []).length,
                approved: (dummyDb.leaves || []).filter(l => l.status === 'Approved').length,
                pending: (dummyDb.leaves || []).filter(l => l.status === 'Pending Approval').length,
                rejected: 0,
                recentApplications: dummyDb.leaves || []
              }
            };
          }
          if (targetPath.includes('/types')) {
            const types = [
              { id: 1, name: 'Casual Leave', code: 'CL', days_allowed: 12, carry_forward: false, status: 'Active' },
              { id: 2, name: 'Sick Leave', code: 'SL', days_allowed: 10, carry_forward: false, status: 'Active' },
              { id: 3, name: 'Privilege Leave', code: 'PL', days_allowed: 15, carry_forward: true, status: 'Active' }
            ];
            return toDemoResponse(types);
          }
          if (targetPath.includes('/all-balances') || targetPath.includes('/balances')) {
            const balances = [
              { type: 'Casual Leave', allocated: 12, used: 2, balance: 10 },
              { type: 'Sick Leave', allocated: 10, used: 1, balance: 9 },
              { type: 'Privilege Leave', allocated: 15, used: 0, balance: 15 }
            ];
            return toDemoResponse(balances);
          }
          const formattedLeaves = (dummyDb.leaves || []).map(l => ({
            id: l.id,
            employee_name: l.employeeName,
            leave_type: l.type,
            from_date: l.fromDate,
            to_date: l.toDate,
            days: l.days,
            status: l.status,
            reason: l.reason,
            created_at: new Date().toISOString()
          }));
          return toDemoResponse(formattedLeaves, { leaves: formattedLeaves });
        }

        // 10. Payroll (Processing, Structures, Components, Payslips, Bonuses, Reimbursements, Loans)
        if (targetPath.includes('/payroll')) {
          if (targetPath.includes('/structures')) {
            return toDemoResponse(dummyDb.salaryStructures || []);
          }
          if (targetPath.includes('/components')) {
            return toDemoResponse(dummyDb.salaryComponents || []);
          }
          if (targetPath.includes('/bonuses')) {
            if (options.method === 'POST') {
              const { addDummyBonus } = await import('./demoDummyStore');
              const b = addDummyBonus(bodyPayload);
              return { success: true, message: 'Bonus entry added', data: b };
            }
            return toDemoResponse(dummyDb.bonuses || []);
          }
          if (targetPath.includes('/reimbursements')) {
            if (options.method === 'POST') {
              const { addDummyReimbursement } = await import('./demoDummyStore');
              const r = addDummyReimbursement(bodyPayload);
              return { success: true, message: 'Reimbursement claim submitted', data: r };
            }
            return toDemoResponse(dummyDb.reimbursements || []);
          }
          if (targetPath.includes('/loans')) {
            if (options.method === 'POST') {
              const { addDummyLoan } = await import('./demoDummyStore');
              const l = addDummyLoan(bodyPayload);
              return { success: true, message: 'Loan application submitted', data: l };
            }
            return toDemoResponse(dummyDb.loans || []);
          }
          const payslipsList = (dummyDb.employees || []).map(e => ({
            id: e.id,
            employee_id: e.id,
            emp_id: e.emp_id,
            name: e.name,
            employee_name: e.name,
            department: e.department,
            designation: e.designation,
            month: 'September',
            year: '2026',
            basic_salary: Math.round((e.salary || 60000) * 0.5),
            hra: Math.round((e.salary || 60000) * 0.25),
            allowances: Math.round((e.salary || 60000) * 0.15),
            gross_salary: e.salary || 60000,
            pf_deduction: 1800,
            tax_deduction: 2500,
            total_deductions: 4300,
            net_salary: (e.salary || 60000) - 4300,
            status: 'Paid',
            payment_date: '2026-09-01'
          }));

          if (targetPath.includes('/payslips') || targetPath === '/payroll' || targetPath.startsWith('/payroll?')) {
            return toDemoResponse(payslipsList, {
              payrollSummary: dummyDb.payrollSummary || {}
            });
          }

          return {
            success: true,
            payroll: dummyDb.payrollSummary || {},
            data: dummyDb.payrollSummary || {}
          };
        }

        // 11. Recruitment (Dashboard, Requirements, Candidates, Interviews, Offers, Pipeline)
        if (targetPath.includes('/requirements/dashboard')) {
          const reqs = dummyDb.requirements || [];
          return {
            success: true,
            data: {
              total: [{ count: reqs.length }],
              open: [{ count: reqs.filter(r => r.status === 'Open').length }],
              pendingApproval: [{ count: 0 }],
              critical: [{ count: reqs.filter(r => r.priority === 'High').length }],
              monthOpenings: [{ count: reqs.length }],
              monthlyTrend: [
                { month: 'Jul', count: 1 },
                { month: 'Aug', count: 2 },
                { month: 'Sep', count: reqs.length }
              ],
              statusPie: [
                { name: 'Open', value: reqs.length }
              ]
            }
          };
        }

        if (targetPath.includes('/requirements/meta/all') || targetPath.includes('/requirements/meta')) {
          const depts = dummyDb.departments || [];
          const desigs = dummyDb.designations || [];
          const emps = (dummyDb.employees || []).map(e => ({ id: e.id, name: e.name }));
          const branches = dummyDb.branches || [{ id: 1, name: 'Headquarters Campus' }];
          const companies = dummyDb.companies || [{ id: 1, name: dummyDb.company?.name || 'MadhuraTech Solutions' }];
          return {
            success: true,
            departments: depts,
            designations: desigs,
            employees: emps,
            hrEmployees: emps,
            branches: branches,
            companies: companies,
            data: { departments: depts, designations: desigs, employees: emps, hrEmployees: emps, branches, companies }
          };
        }

        if (targetPath.includes('/requirements')) {
          if (options.method === 'POST') {
            const { addDummyRequirement } = await import('./demoDummyStore');
            const newReq = addDummyRequirement(bodyPayload);
            return { success: true, message: 'Requirement created in demo database', requirement: newReq, data: newReq };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyRequirement } = await import('./demoDummyStore');
            const updated = updateDummyRequirement(id, bodyPayload);
            return { success: true, message: 'Requirement updated', requirement: updated, data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyRequirement } = await import('./demoDummyStore');
            deleteDummyRequirement(id);
            return { success: true, message: 'Requirement deleted' };
          }
          const reqs = dummyDb.requirements || [];
          return {
            success: true,
            data: {
              requirements: reqs,
              total: reqs.length
            },
            requirements: reqs,
            total: reqs.length
          };
        }

        if (targetPath.includes('/candidates/dropdown')) {
          const cands = (dummyDb.candidates || []).map(c => ({
            id: c.id,
            name: c.name || c.candidate_name,
            email: c.email,
            job_title: c.job_title
          }));
          return { success: true, data: cands };
        }

        if (targetPath.includes('/candidates')) {
          if (options.method === 'POST') {
            const { addDummyCandidate } = await import('./demoDummyStore');
            const newCand = addDummyCandidate(bodyPayload);
            return { success: true, message: 'Candidate added to demo database', candidate: newCand, data: newCand };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyCandidate } = await import('./demoDummyStore');
            const updated = updateDummyCandidate(id, bodyPayload);
            return { success: true, message: 'Candidate updated', candidate: updated, data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyCandidate } = await import('./demoDummyStore');
            deleteDummyCandidate(id);
            return { success: true, message: 'Candidate deleted' };
          }
          const cands = dummyDb.candidates || [];
          return {
            success: true,
            data: {
              candidates: cands,
              total: cands.length
            },
            candidates: cands,
            total: cands.length
          };
        }

        if (targetPath.includes('/pipeline/stats')) {
          return {
            success: true,
            data: {
              totals: {
                sourced: 0,
                screening: 0,
                interview: 0,
                offered: 0,
                hired: 0
              },
              breakdown: [],
              insights: {
                avgTimeToHire: '0 Days',
                offerAcceptanceRate: '0%'
              }
            }
          };
        }

        if (targetPath.includes('/pipeline/sources')) {
          return {
            success: true,
            data: []
          };
        }

        if (targetPath.includes('/interviews')) {
          return toDemoResponse(dummyDb.interviews || []);
        }

        if (targetPath.includes('/offers')) {
          return {
            success: true,
            data: {
              offers: dummyDb.offers || [],
              total: (dummyDb.offers || []).length
            }
          };
        }

        // 12. Onboarding & Performance
        if (targetPath.includes('/onboarding')) {
          return toDemoResponse([]);
        }

        if (targetPath.includes('/goals/dashboard')) {
          const goals = dummyDb.goals || [];
          return {
            success: true,
            data: {
              totalGoals: goals.length,
              onTrack: goals.filter(g => g.status === 'On Track').length,
              atRisk: goals.filter(g => g.status === 'At Risk').length,
              completed: goals.filter(g => g.status === 'Completed').length
            }
          };
        }

        if (targetPath.includes('/goals') || targetPath.includes('/performance/goals')) {
          if (options.method === 'POST') {
            const { addDummyGoal } = await import('./demoDummyStore');
            const newGoal = addDummyGoal(bodyPayload);
            return { success: true, message: 'Goal added to demo database', goal: newGoal, data: newGoal };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyGoal } = await import('./demoDummyStore');
            const updated = updateDummyGoal(id, bodyPayload);
            return { success: true, message: 'Goal updated', goal: updated, data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyGoal } = await import('./demoDummyStore');
            deleteDummyGoal(id);
            return { success: true, message: 'Goal removed' };
          }
          const goals = dummyDb.goals || [];
          return {
            success: true,
            data: {
              goals,
              total: goals.length
            },
            goals,
            total: goals.length
          };
        }

        if (targetPath.includes('/kpis') || targetPath.includes('/kras')) {
          return toDemoResponse([]);
        }

        if (targetPath.includes('/reviews/dashboard')) {
          return {
            success: true,
            data: {
              totalReviews: 0,
              completed: 0,
              pending: 0,
              avgScore: 0
            }
          };
        }

        if (targetPath.includes('/reviews') || targetPath.includes('/promotions') || targetPath.includes('/appraisals')) {
          return toDemoResponse([]);
        }

        // 13. Timesheets, Project Team, Sprints & Expenses
        if (targetPath.includes('/timesheets')) {
          if (options.method === 'POST') {
            const { addDummyTimesheet } = await import('./demoDummyStore');
            const ts = addDummyTimesheet(bodyPayload);
            return { success: true, message: 'Timesheet submitted', data: ts };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyTimesheet } = await import('./demoDummyStore');
            const updated = updateDummyTimesheet(id, bodyPayload);
            return { success: true, message: 'Timesheet updated', data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyTimesheet } = await import('./demoDummyStore');
            deleteDummyTimesheet(id);
            return { success: true, message: 'Timesheet removed' };
          }
          return toDemoResponse(dummyDb.timesheets || []);
        }

        if (targetPath.includes('/project-team')) {
          return toDemoResponse(dummyDb.projectTeam || []);
        }

        if (targetPath.includes('/sprints')) {
          return {
            success: true,
            data: [
              { id: 1, name: 'Sprint 1 - Core Architecture', status: 'Active', start_date: '2026-09-01', end_date: '2026-09-30' }
            ]
          };
        }

        if (targetPath.includes('/expenses')) {
          if (options.method === 'POST') {
            const { addDummyExpense } = await import('./demoDummyStore');
            const exp = addDummyExpense(bodyPayload);
            return { success: true, message: 'Expense claim submitted', data: exp };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyExpense } = await import('./demoDummyStore');
            const updated = updateDummyExpense(id, bodyPayload);
            return { success: true, message: 'Expense claim updated', data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyExpense } = await import('./demoDummyStore');
            deleteDummyExpense(id);
            return { success: true, message: 'Expense claim removed' };
          }
          return toDemoResponse(dummyDb.expenses || []);
        }

        // 14. Documents (Templates, Policies, Dashboard)
        if (targetPath.includes('/documents/dashboard')) {
          return {
            success: true,
            data: {
              totalDocuments: (dummyDb.policies || []).length + (dummyDb.templates || []).length,
              templates: (dummyDb.templates || []).length,
              signed: 0,
              pending: 0
            }
          };
        }

        if (targetPath.includes('/documents/templates')) {
          return toDemoResponse(dummyDb.templates || []);
        }

        if (targetPath.includes('/documents/policies')) {
          return toDemoResponse(dummyDb.policies || []);
        }

        if (targetPath.includes('/documents')) {
          return toDemoResponse([]);
        }

        // 15. Help Desk (Tickets & Categories)
        if (targetPath.includes('/helpdesk/dashboard')) {
          const tkts = dummyDb.tickets || [];
          return {
            success: true,
            data: {
              totalTickets: tkts.length,
              open: tkts.filter(t => t.status === 'Open').length,
              inProgress: tkts.filter(t => t.status === 'In Progress').length,
              resolved: 0
            }
          };
        }

        if (targetPath.includes('/helpdesk') || targetPath.includes('/tickets')) {
          if (options.method === 'POST') {
            const { addDummyTicket } = await import('./demoDummyStore');
            const tkt = addDummyTicket(bodyPayload);
            return { success: true, message: 'Ticket created in demo database', ticket: tkt, data: tkt };
          }
          if (options.method === 'PUT') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { updateDummyTicket } = await import('./demoDummyStore');
            const updated = updateDummyTicket(id, bodyPayload);
            return { success: true, message: 'Ticket updated', ticket: updated, data: updated };
          }
          if (options.method === 'DELETE') {
            const id = targetPath.split('/').filter(Boolean).pop();
            const { deleteDummyTicket } = await import('./demoDummyStore');
            deleteDummyTicket(id);
            return { success: true, message: 'Ticket removed' };
          }
          return toDemoResponse(dummyDb.tickets || []);
        }

        // 16. Role Permissions & User Roles & RBAC
        if (targetPath.includes('/rbac/roles')) {
          return toDemoResponse([
            { id: 1, role_key: 'super_admin', role_name: 'Super Admin', description: 'Complete system control' },
            { id: 2, role_key: 'team_leader', role_name: 'Team Leader', description: 'Team and task management' },
            { id: 3, role_key: 'employee', role_name: 'Employee', description: 'Self-service portal access' }
          ]);
        }

        if (targetPath.includes('/rbac/user-permissions') || targetPath.includes('/rbac/permissions')) {
          const allPerms = {
            dashboard: { view: true, create: true, edit: true, delete: true },
            organization: { view: true, create: true, edit: true, delete: true },
            employees: { view: true, create: true, edit: true, delete: true },
            attendance: { view: true, create: true, edit: true, delete: true },
            leave: { view: true, create: true, edit: true, delete: true },
            leaves: { view: true, create: true, edit: true, delete: true },
            payroll: { view: true, create: true, edit: true, delete: true },
            recruitment: { view: true, create: true, edit: true, delete: true },
            onboarding: { view: true, create: true, edit: true, delete: true },
            performance: { view: true, create: true, edit: true, delete: true },
            projects: { view: true, create: true, edit: true, delete: true },
            clients: { view: true, create: true, edit: true, delete: true },
            expenses: { view: true, create: true, edit: true, delete: true },
            documents: { view: true, create: true, edit: true, delete: true },
            helpdesk: { view: true, create: true, edit: true, delete: true },
            settings: { view: true, create: true, edit: true, delete: true }
          };
          return {
            success: true,
            permissions: allPerms,
            data: allPerms
          };
        }

        // 17. Reports Directory & Analytics
        if (targetPath.includes('/reports/employee')) {
          const depts = (dummyDb.departments || []).map(d => {
            const count = (dummyDb.employees || []).filter(e => e.department === d.name).length || 1;
            return {
              dept: d.name,
              total: count,
              active: count,
              leave: 0,
              joiners: 1,
              resigned: 0,
              age: '29',
              exp: '3.5 yrs'
            };
          });
          return {
            success: true,
            data: {
              kpis: {
                totalEmployees: (dummyDb.employees || []).length,
                activeEmployees: (dummyDb.employees || []).length,
                newJoinersMonth: 1,
                resignedMonth: 0,
                retentionRate: '100%'
              },
              summary: depts.length ? depts : [{ dept: 'Management', total: 1, active: 1, leave: 0, joiners: 1, resigned: 0, age: '30', exp: '5 yrs' }]
            }
          };
        }

        if (targetPath.includes('/reports/attendance')) {
          const depts = (dummyDb.departments || []).map(d => {
            const count = (dummyDb.employees || []).filter(e => e.department === d.name).length || 1;
            return {
              dept: d.name,
              total: count,
              present: count,
              absent: 0,
              late: 0,
              half: 0,
              pct: '100%'
            };
          });
          return {
            success: true,
            data: {
              kpis: {
                avgAttendanceRate: '98.5%',
                totalPunchesMonth: 240,
                onTimePunches: 232,
                lateArrivals: 8,
                absences: 0
              },
              summary: depts.length ? depts : [{ dept: 'Management', total: 1, present: 1, absent: 0, late: 0, half: 0, pct: '100%' }]
            }
          };
        }

        if (targetPath.includes('/reports/leave')) {
          const depts = (dummyDb.departments || []).map(d => ({
            dept: d.name,
            req: 1,
            app: 1,
            rej: 0,
            days: 2
          }));
          return {
            success: true,
            data: {
              kpis: {
                totalRequests: (dummyDb.leaves || []).length,
                approvedLeaves: (dummyDb.leaves || []).filter(l => l.status === 'Approved').length,
                pendingApprovals: (dummyDb.leaves || []).filter(l => l.status === 'Pending Approval').length,
                totalDaysTaken: (dummyDb.leaves || []).reduce((acc, l) => acc + (l.days || 1), 0)
              },
              summary: depts.length ? depts : [{ dept: 'Management', req: 1, app: 1, rej: 0, days: 1 }]
            }
          };
        }

        if (targetPath.includes('/reports/payroll')) {
          const depts = (dummyDb.departments || []).map(d => {
            const count = (dummyDb.employees || []).filter(e => e.department === d.name).length || 1;
            return {
              dept: d.name,
              emp: count,
              cost: '₹' + (count * 60000).toLocaleString(),
              net: '₹' + (count * 55000).toLocaleString(),
              ded: '₹' + (count * 5000).toLocaleString(),
              tax: '₹' + (count * 2500).toLocaleString()
            };
          });
          return {
            success: true,
            data: {
              kpis: {
                totalGrossPayroll: '₹' + ((dummyDb.employees || []).length * 60000).toLocaleString(),
                totalNetDisbursed: '₹' + ((dummyDb.employees || []).length * 55000).toLocaleString(),
                totalTaxDeducted: '₹' + ((dummyDb.employees || []).length * 2500).toLocaleString(),
                processedPayslips: (dummyDb.employees || []).length
              },
              summary: depts.length ? depts : [{ dept: 'Management', emp: 1, cost: '₹60,000', net: '₹55,000', ded: '₹5,000', tax: '₹2,500' }]
            }
          };
        }

        if (targetPath.includes('/reports/recruitment')) {
          return {
            success: true,
            data: {
              kpis: {
                totalOpenings: (dummyDb.requirements || []).length,
                totalApplications: (dummyDb.candidates || []).length,
                interviewsConducted: (dummyDb.interviews || []).length,
                offersExtended: (dummyDb.offers || []).length,
                hiredThisMonth: 1
              },
              deptHiring: [
                { dept: 'Engineering', count: 2 },
                { dept: 'Management', count: 1 }
              ]
            }
          };
        }

        if (targetPath.includes('/reports/performance')) {
          const depts = (dummyDb.departments || []).map(d => ({
            dept: d.name,
            avg: '4.8',
            out: 1,
            exc: 1,
            meets: 0,
            needs: 0,
            un: 0
          }));
          return {
            success: true,
            data: {
              kpis: {
                avgCompanyRating: '4.8 / 5.0',
                topPerformersCount: (dummyDb.employees || []).length,
                goalsCompletedRate: '95%'
              },
              summary: depts.length ? depts : [{ dept: 'Management', avg: '5.0', out: 1, exc: 0, meets: 0, needs: 0, un: 0 }]
            }
          };
        }

        if (targetPath.includes('/reports/project')) {
          const projs = dummyDb.projects || [];
          return {
            success: true,
            data: {
              kpis: {
                totalActiveProjects: projs.length,
                completedProjects: projs.filter(p => p.status === 'Completed').length,
                onTrackProjects: projs.filter(p => p.status === 'In Progress').length,
                totalRevenueBudget: '₹' + projs.reduce((acc, p) => acc + (p.budget || 0), 0).toLocaleString()
              },
              progressList: projs.slice(0, 5).map(p => ({
                name: p.title || p.project_name || 'Enterprise System',
                pct: p.progress || 50,
                status: p.status || 'In Progress'
              }))
            }
          };
        }

        // 18. Notifications & System Alerts
        if (targetPath.includes('/notifications')) {
          return {
            success: true,
            notifications: [
              { id: 1, title: 'Welcome to your 3-Hour Demo', description: 'Explore all 18 HR modules with your isolated dummy database.', read: false, createdAt: new Date().toISOString() }
            ]
          };
        }

        // Universal Fallback for ANY demo endpoint: Smart Dynamic CRUD Persistence in localStorage!
        const segments = targetPath.split('/').filter(Boolean);
        const collectionKey = (segments[0] === 'app' || segments[0] === 'api') ? (segments[1] || 'generic') : (segments[0] || 'generic');

        if (options.method === 'POST') {
          const newItem = { id: Date.now(), ...(bodyPayload || {}), createdAt: new Date().toISOString() };
          const list = Array.isArray(dummyDb[collectionKey]) ? dummyDb[collectionKey] : [];
          dummyDb[collectionKey] = [newItem, ...list];
          const { saveDummyDb } = await import('./demoDummyStore');
          saveDummyDb(dummyDb);
          return { success: true, message: 'Item created in demo store', data: newItem, [collectionKey]: dummyDb[collectionKey] };
        }

        if (options.method === 'PUT' || options.method === 'PATCH') {
          const targetId = segments[segments.length - 1];
          const list = Array.isArray(dummyDb[collectionKey]) ? dummyDb[collectionKey] : [];
          dummyDb[collectionKey] = list.map(item => String(item.id) === String(targetId) ? { ...item, ...(bodyPayload || {}) } : item);
          const { saveDummyDb } = await import('./demoDummyStore');
          saveDummyDb(dummyDb);
          return { success: true, message: 'Item updated in demo store', data: bodyPayload, [collectionKey]: dummyDb[collectionKey] };
        }

        if (options.method === 'DELETE') {
          const targetId = segments[segments.length - 1];
          const list = Array.isArray(dummyDb[collectionKey]) ? dummyDb[collectionKey] : [];
          dummyDb[collectionKey] = list.filter(item => String(item.id) !== String(targetId));
          const { saveDummyDb } = await import('./demoDummyStore');
          saveDummyDb(dummyDb);
          return { success: true, message: 'Item deleted from demo store', [collectionKey]: dummyDb[collectionKey] };
        }

        const fallbackData = dummyDb[collectionKey] || [];
        return toDemoResponse(fallbackData, { success: true, message: 'Demo operation successful' });
      }
    } catch (e) {
      console.warn('Dummy store interception notice:', e);
      return toDemoResponse([], { success: true, message: 'Demo operation successful' });
    }
  }

  try {
    const res = await nativeFetch(`${API_BASE}${targetPath}`, { ...options, headers });
    const text = await res.text();
    if (!text || !text.trim()) {
      return { success: res.ok, status: res.status };
    }
    const json = JSON.parse(text);
    if (!res.ok && json && json.message && !json.error) {
      json.error = json.message;
    }
    return json;
  } catch (e) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, offline: true, message: 'Internet connection unavailable' };
    }
    // Only warn if this isn't a transient network drop
    console.warn(`apiFetch notice for ${path}:`, e.message || e);
    return { success: false, message: e.message || 'Network request failed' };
  }
};

// ─── Global Window Fetch Monkey Patch for Legacy / Direct Component Fetch Calls ──
if (typeof window !== 'undefined' && !window.__hrms_fetch_intercepted) {
  window.__hrms_fetch_intercepted = true;
  const originalWindowFetch = window.fetch.bind(window);

  window.fetch = async function (input, init) {
    try {
      const urlString = typeof input === 'string' ? input : (input instanceof Request ? input.url : String(input));
      
      let isDemo = false;
      try {
        if (localStorage.getItem('hrms_is_demo_sandbox') === 'true') {
          const meta = JSON.parse(localStorage.getItem('hrms_3hr_demo_meta') || '{}');
          if (!meta.expiresAt || Date.now() < meta.expiresAt) isDemo = true;
        } else {
          const meta = JSON.parse(localStorage.getItem('hrms_3hr_demo_meta') || '{}');
          if (meta?.isActive && meta?.is3HourDemo && (!meta.expiresAt || Date.now() < meta.expiresAt)) {
            isDemo = true;
          }
        }
      } catch (e) {}

      const isStaticAsset = urlString.includes('.js') || urlString.includes('.css') || urlString.includes('.svg') ||
                            urlString.includes('.png') || urlString.includes('.jpg') || urlString.includes('.woff') ||
                            urlString.includes('@vite') || urlString.includes('@fs') || urlString.includes('node_modules');
      const isTrialCall = urlString.includes('/trial') || urlString.includes('/auth/login');

      if (isDemo && !isStaticAsset && !isTrialCall) {
        let cleanPath = urlString;
        if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
          try {
            const parsedUrl = new URL(cleanPath);
            cleanPath = parsedUrl.pathname + parsedUrl.search;
          } catch (e) {}
        }

        const result = await apiFetch(cleanPath, init);
        return new Response(JSON.stringify(result), {
          status: result && result.status ? result.status : (result?.success === false ? 400 : 200),
          statusText: 'OK',
          headers: new Headers({ 'Content-Type': 'application/json' })
        });
      }
    } catch (err) {
      console.warn('Window fetch interception warning:', err);
    }
    return originalWindowFetch(input, init);
  };
}

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