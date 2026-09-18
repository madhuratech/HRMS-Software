/**
 * demoDummyStore.js
 * 
 * 100% Isolated 3-Hour Demo Database Storage.
 * Completely sandboxed:
 * - Serves brand-new HRMS data tailored to the customer's organization.
 * - Stores all customer creates/edits for 3 hours only.
 * - Auto-purges when 3 hours elapse.
 * - Guarantees the production database is NEVER touched or visible during demo.
 */

const DEMO_DB_KEY = 'hrms_3hr_demo_dummy_db';
const DEMO_META_KEY = 'hrms_3hr_demo_meta';

export const isDemoSessionActive = () => {
  try {
    const meta = JSON.parse(localStorage.getItem(DEMO_META_KEY) || '{}');
    if (!meta || !meta.isActive) return false;
    const now = Date.now();
    if (meta.expiresAt && now >= meta.expiresAt) {
      // 3 hours expired -> auto purge
      purgeExpiredDemoSession();
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const getDemoTimeRemainingSeconds = () => {
  try {
    const meta = JSON.parse(localStorage.getItem(DEMO_META_KEY) || '{}');
    if (!meta || !meta.expiresAt) return 0;
    const remaining = Math.max(0, Math.floor((meta.expiresAt - Date.now()) / 1000));
    if (remaining <= 0) {
      purgeExpiredDemoSession();
    }
    return remaining;
  } catch (e) {
    return 0;
  }
};

export const purgeExpiredDemoSession = () => {
  try {
    const meta = JSON.parse(localStorage.getItem(DEMO_META_KEY) || '{}');
    if (meta && meta.email) {
      // Update status in trial submissions
      const submissions = JSON.parse(localStorage.getItem('hrms_trial_submissions') || '[]');
      const updated = submissions.map(s => {
        if (s.email.toLowerCase() === meta.email.toLowerCase()) {
          return { ...s, status: 'Demo Expired', demoExpiresAt: Date.now() };
        }
        return s;
      });
      localStorage.setItem('hrms_trial_submissions', JSON.stringify(updated));
    }
  } catch (e) {}

  // Delete dummy database and active session
  localStorage.removeItem(DEMO_DB_KEY);
  localStorage.removeItem(DEMO_META_KEY);
  localStorage.removeItem('hrms_is_demo_sandbox');
  localStorage.removeItem('hrms_trial_session');
};

export const initializeDummyDatabase = (customerCompany = 'My Company', customerName = 'Customer Admin', forceReset = false) => {
  const existing = localStorage.getItem(DEMO_DB_KEY);
  if (existing && !forceReset) {
    try {
      const parsed = JSON.parse(existing);
      // If existing DB contains old fake staff (e.g. Alex Chen), automatically reset to clean empty state!
      const hasOldFakeData = parsed?.employees?.some(e => e.name === 'Alex Chen' || e.name === 'Sarah Jenkins');
      if (parsed && parsed.initialized && !hasOldFakeData) return parsed;
    } catch (e) {}
  }

  const cleanCompany = customerCompany || 'My Company';
  const cleanName = customerName || 'Customer Admin';

  const initialDb = {
    initialized: true,
    createdAt: Date.now(),
    company: {
      name: cleanCompany,
      industry: 'IT & Software',
      employeeCount: 1,
      departments: ['Management'],
      locations: ['HQ - Main Campus']
    },
    departments: [
      { id: 1, name: 'Management', head: cleanName, employees_count: 1 }
    ],
    designations: [
      { id: 1, name: 'Managing Director & Super Admin', department: 'Management' }
    ],
    employees: [
      {
        id: 1,
        emp_id: 'EMP-001',
        name: cleanName,
        email: 'admin@' + cleanCompany.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
        department: 'Management',
        designation: 'Managing Director & Super Admin',
        status: 'Active',
        join_date: new Date().toISOString().split('T')[0],
        phone: '',
        salary: 0,
        role: 'SUPER_ADMIN',
        avatar: null
      }
    ],
    attendanceToday: [],
    leaves: [],
    payrollSummary: {
      month: 'September 2026',
      totalEmployees: 1,
      totalGross: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      status: 'Ready for Processing',
      disbursementDate: '30 Sep 2026'
    },
    projects: [],
    clients: [],
    tasks: [],
    requirements: [],
    candidates: [],
    interviews: [],
    offers: [],
    goals: [],
    salaryStructures: [],
    salaryComponents: [],
    tickets: [],
    policies: [],
    templates: []
  };

  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(initialDb));
  return initialDb;
};

export const getDummyDb = () => {
  try {
    const raw = localStorage.getItem(DEMO_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.initialized) return parsed;
    }
  } catch (e) {}

  const meta = JSON.parse(localStorage.getItem(DEMO_META_KEY) || '{}');
  return initializeDummyDatabase(meta.company, meta.customerName);
};

export const saveDummyDb = (data) => {
  try {
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving dummy DB:', e);
  }
};

/**
 * Returns complete dynamic stats for SuperAdminDashboard
 * Accurately reflects customer's real demo data starting from a clean empty slate!
 */
export const getDummyDashboardStats = () => {
  const db = getDummyDb();
  const employees = db.employees || [];
  const projects = db.projects || [];
  const attendance = db.attendanceToday || [];
  const leaves = db.leaves || [];
  const clients = db.clients || [];

  const performanceEmployees = (employees || []).filter(e => e.role !== 'SUPER_ADMIN').slice(0, 5).map((emp) => ({
    id: emp.id,
    name: emp.name,
    profile_photo: emp.avatar,
    dept: emp.department || 'Management',
    designation: emp.designation || 'Specialist',
    score: '5.00',
    goals: '100%',
    stars: 5,
    trend: '↑ 0.0%',
    isUp: 1
  }));

  const departmentSummary = (db.departments || []).map(d => ({
    dept: d.name,
    emp: employees.filter(e => e.department === d.name).length
  }));

  return {
    success: true,
    totalEmployees: employees.length,
    totalDepartments: (db.departments || []).length,
    totalBranches: 1,
    totalLeaves: leaves.filter(l => l.status === 'Approved').length,
    attendanceToday: attendance.filter(a => a.status === 'Present').length,
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === 'Completed').length,
    totalClients: clients.length,
    totalRevenue: projects.reduce((acc, p) => acc + (p.budget || 0), 0),
    departmentSummary,
    recentActivity: attendance.slice(0, 5).map(a => ({
      punch_type: 'IN',
      punch_time: new Date().toISOString().split('T')[0] + ' ' + (a.punchIn || '09:00 AM'),
      employee_id: a.id,
      employee_name: a.name,
      profile_photo: null
    })),
    upcomingHolidays: [],
    upcomingBirthdays: [],
    performanceEmployees,
    recentLeaves: leaves.map(l => ({
      id: l.id,
      employee_name: l.employeeName,
      profile_photo: null,
      dept: 'Operations',
      leave_name: l.type,
      duration: l.days
    })),
    teamPerformance: []
  };
};

export const addDummyEmployee = (empData) => {
  const db = getDummyDb();
  const newEmp = {
    id: Date.now(),
    emp_id: `EMP-${String((db.employees || []).length + 1).padStart(3, '0')}`,
    name: empData.name || empData.first_name || 'New Employee',
    email: empData.email || 'employee@company.com',
    department: empData.department || empData.dept_name || 'Engineering',
    designation: empData.designation || empData.role_name || 'Software Engineer',
    status: 'Active',
    join_date: empData.join_date || new Date().toISOString().split('T')[0],
    phone: empData.phone || '+91 98765 00000',
    salary: parseFloat(empData.salary || empData.ctc) || 65000,
    role: empData.role || 'EMPLOYEE',
    avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(empData.name || 'User') + '&background=2563EB&color=fff'
  };
  db.employees = [newEmp, ...(db.employees || [])];
  saveDummyDb(db);
  return newEmp;
};

export const updateDummyEmployee = (id, updateData) => {
  const db = getDummyDb();
  db.employees = (db.employees || []).map(emp => {
    if (emp.id === Number(id) || emp.id === id || emp.emp_id === id) {
      return { ...emp, ...updateData };
    }
    return emp;
  });
  saveDummyDb(db);
  return db.employees.find(e => e.id === Number(id) || e.id === id || e.emp_id === id);
};

export const deleteDummyEmployee = (id) => {
  const db = getDummyDb();
  db.employees = (db.employees || []).filter(emp => emp.id !== Number(id) && emp.id !== id && emp.emp_id !== id);
  saveDummyDb(db);
  return { success: true };
};

export const addDummyAttendance = (attData) => {
  const db = getDummyDb();
  const newAtt = {
    id: Date.now(),
    emp_id: attData.emp_id || 'EMP-001',
    name: attData.name || 'Customer Admin',
    punchIn: attData.punchIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    punchOut: attData.punchOut || '-',
    status: attData.status || 'Present',
    location: attData.location || 'HQ Geofence',
    type: attData.type || 'Web Punch'
  };
  db.attendanceToday = [newAtt, ...(db.attendanceToday || [])];
  saveDummyDb(db);
  return newAtt;
};

export const addDummyLeave = (leaveData) => {
  const db = getDummyDb();
  const newLeave = {
    id: 'LV-' + Math.floor(100 + Math.random() * 900),
    employeeName: leaveData.employeeName || leaveData.name || 'Customer Admin',
    type: leaveData.type || 'Casual Leave',
    fromDate: leaveData.fromDate || new Date().toISOString().split('T')[0],
    toDate: leaveData.toDate || new Date().toISOString().split('T')[0],
    days: Number(leaveData.days || 1),
    status: 'Pending Approval',
    reason: leaveData.reason || 'Personal work'
  };
  db.leaves = [newLeave, ...(db.leaves || [])];
  saveDummyDb(db);
  return newLeave;
};

export const addDummyDepartment = (deptData) => {
  const db = getDummyDb();
  const newDept = {
    id: Date.now(),
    name: deptData.name || 'Operations',
    head: deptData.head || 'Super Admin',
    employees_count: 1
  };
  db.departments = [...(db.departments || []), newDept];
  saveDummyDb(db);
  return newDept;
};

export const addDummyDesignation = (desigData) => {
  const db = getDummyDb();
  const newDesig = {
    id: Date.now(),
    name: desigData.name || 'Specialist',
    department: desigData.department || 'Operations'
  };
  db.designations = [...(db.designations || []), newDesig];
  saveDummyDb(db);
  return newDesig;
};

export const addDummyProject = (projData) => {
  const db = getDummyDb();
  const newProj = {
    id: Date.now(),
    title: projData.project_name || projData.title || 'New Initiative',
    project_name: projData.project_name || projData.title || 'New Initiative',
    client: projData.client || projData.client_name || 'Enterprise Client',
    client_name: projData.client || projData.client_name || 'Enterprise Client',
    status: projData.status || 'In Progress',
    budget: Number(projData.budget || 100000),
    progress: Number(projData.progress || 10)
  };
  db.projects = [newProj, ...(db.projects || [])];
  saveDummyDb(db);
  return newProj;
};

export const updateDummyProject = (id, projData) => {
  const db = getDummyDb();
  db.projects = (db.projects || []).map(p => {
    if (p.id === Number(id) || String(p.id) === String(id)) {
      return { ...p, ...projData };
    }
    return p;
  });
  saveDummyDb(db);
  return db.projects.find(p => p.id === Number(id) || String(p.id) === String(id));
};

export const deleteDummyProject = (id) => {
  const db = getDummyDb();
  db.projects = (db.projects || []).filter(p => p.id !== Number(id) && String(p.id) !== String(id));
  saveDummyDb(db);
  return { success: true };
};

export const addDummyClient = (clientData) => {
  const db = getDummyDb();
  const newClient = {
    id: Date.now(),
    name: clientData.client_name || clientData.name || clientData.company_name || 'Acme Partner',
    client_name: clientData.client_name || clientData.name || clientData.company_name || 'Acme Partner',
    industry: clientData.industry || 'Technology',
    status: clientData.status || 'Active'
  };
  db.clients = [newClient, ...(db.clients || [])];
  saveDummyDb(db);
  return newClient;
};

export const updateDummyClient = (id, clientData) => {
  const db = getDummyDb();
  db.clients = (db.clients || []).map(c => {
    if (c.id === Number(id) || String(c.id) === String(id)) {
      return { ...c, ...clientData };
    }
    return c;
  });
  saveDummyDb(db);
  return db.clients.find(c => c.id === Number(id) || String(c.id) === String(id));
};

export const deleteDummyClient = (id) => {
  const db = getDummyDb();
  db.clients = (db.clients || []).filter(c => c.id !== Number(id) && String(c.id) !== String(id));
  saveDummyDb(db);
  return { success: true };
};

export const updateDummyCompanyProfile = (compData) => {
  const db = getDummyDb();
  db.company = { ...(db.company || {}), ...compData };
  saveDummyDb(db);
  return db.company;
};

// ─── Task CRUD ───────────────────────────────────────────────
export const addDummyTask = (taskData) => {
  const db = getDummyDb();
  const newTask = {
    id: Date.now(),
    title: taskData.title || 'New Task',
    project_id: Number(taskData.project_id || 1),
    project_name: taskData.project_name || 'Enterprise Project',
    assignee_id: Number(taskData.assignee_id || 1),
    assignee_name: taskData.assignee_name || 'Team Member',
    priority: taskData.priority || 'Medium',
    status: taskData.status || 'In Progress',
    start_date: taskData.start_date || new Date().toISOString().split('T')[0],
    due_date: taskData.due_date || new Date().toISOString().split('T')[0],
    description: taskData.description || ''
  };
  db.tasks = [newTask, ...(db.tasks || [])];
  saveDummyDb(db);
  return newTask;
};

export const updateDummyTask = (id, taskData) => {
  const db = getDummyDb();
  db.tasks = (db.tasks || []).map(t => {
    if (t.id === Number(id) || String(t.id) === String(id)) {
      return { ...t, ...taskData };
    }
    return t;
  });
  saveDummyDb(db);
  return db.tasks.find(t => t.id === Number(id) || String(t.id) === String(id));
};

export const deleteDummyTask = (id) => {
  const db = getDummyDb();
  db.tasks = (db.tasks || []).filter(t => t.id !== Number(id) && String(t.id) !== String(id));
  saveDummyDb(db);
  return { success: true };
};

// ─── Requirement (Job Opening) CRUD ──────────────────────────
export const addDummyRequirement = (reqData) => {
  const db = getDummyDb();
  const newReq = {
    id: Date.now(),
    title: reqData.title || 'New Position',
    department_name: reqData.department_name || reqData.department || 'Engineering',
    department_id: Number(reqData.department_id || 2),
    positions: Number(reqData.positions || 1),
    status: reqData.status || 'Open',
    priority: reqData.priority || 'Medium',
    experience: reqData.experience || '2-4 Years',
    created_at: new Date().toISOString().split('T')[0]
  };
  db.requirements = [newReq, ...(db.requirements || [])];
  saveDummyDb(db);
  return newReq;
};

export const updateDummyRequirement = (id, reqData) => {
  const db = getDummyDb();
  db.requirements = (db.requirements || []).map(r => {
    if (r.id === Number(id) || String(r.id) === String(id)) {
      return { ...r, ...reqData };
    }
    return r;
  });
  saveDummyDb(db);
  return db.requirements.find(r => r.id === Number(id) || String(r.id) === String(id));
};

export const deleteDummyRequirement = (id) => {
  const db = getDummyDb();
  db.requirements = (db.requirements || []).filter(r => r.id !== Number(id) && String(r.id) !== String(id));
  saveDummyDb(db);
  return { success: true };
};

// ─── Candidate CRUD ──────────────────────────────────────────
export const addDummyCandidate = (candData) => {
  const db = getDummyDb();
  const newCand = {
    id: Date.now(),
    name: candData.name || candData.candidate_name || 'New Candidate',
    candidate_name: candData.name || candData.candidate_name || 'New Candidate',
    email: candData.email || 'candidate@gmail.com',
    job_title: candData.job_title || 'Software Engineer',
    stage: candData.stage || 'Screening',
    status: candData.status || 'Applied',
    phone: candData.phone || '+91 98000 00000'
  };
  db.candidates = [newCand, ...(db.candidates || [])];
  saveDummyDb(db);
  return newCand;
};

export const updateDummyCandidate = (id, candData) => {
  const db = getDummyDb();
  db.candidates = (db.candidates || []).map(c => {
    if (c.id === Number(id) || String(c.id) === String(id)) {
      return { ...c, ...candData };
    }
    return c;
  });
  saveDummyDb(db);
  return db.candidates.find(c => c.id === Number(id) || String(c.id) === String(id));
};

export const deleteDummyCandidate = (id) => {
  const db = getDummyDb();
  db.candidates = (db.candidates || []).filter(c => c.id !== Number(id) && String(c.id) !== String(id));
  saveDummyDb(db);
  return { success: true };
};

// ─── Ticket (Helpdesk) CRUD ──────────────────────────────────
export const addDummyTicket = (ticketData) => {
  const db = getDummyDb();
  const newTkt = {
    id: Date.now(),
    ticket_no: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
    subject: ticketData.subject || 'Support Ticket',
    priority: ticketData.priority || 'Medium',
    status: 'Open',
    requester: ticketData.requester || 'Customer Admin',
    department: ticketData.department || 'Operations',
    created_at: new Date().toISOString().split('T')[0]
  };
  db.tickets = [newTkt, ...(db.tickets || [])];
  saveDummyDb(db);
  return newTkt;
};

export const updateDummyTicket = (id, ticketData) => {
  const db = getDummyDb();
  db.tickets = (db.tickets || []).map(t => {
    if (t.id === Number(id) || String(t.id) === String(id) || t.ticket_no === id) {
      return { ...t, ...ticketData };
    }
    return t;
  });
  saveDummyDb(db);
  return db.tickets.find(t => t.id === Number(id) || String(t.id) === String(id) || t.ticket_no === id);
};

export const deleteDummyTicket = (id) => {
  const db = getDummyDb();
  db.tickets = (db.tickets || []).filter(t => t.id !== Number(id) && String(t.id) !== String(id) && t.ticket_no !== id);
  saveDummyDb(db);
  return { success: true };
};

// ─── Goal CRUD ───────────────────────────────────────────────
export const addDummyGoal = (goalData) => {
  const db = getDummyDb();
  const newGoal = {
    id: Date.now(),
    title: goalData.title || 'New Goal',
    owner: goalData.owner || 'Customer Admin',
    department_id: Number(goalData.department_id || 1),
    progress: Number(goalData.progress || 0),
    status: goalData.status || 'On Track',
    due_date: goalData.due_date || new Date().toISOString().split('T')[0]
  };
  db.goals = [newGoal, ...(db.goals || [])];
  saveDummyDb(db);
  return newGoal;
};

export const updateDummyGoal = (id, goalData) => {
  const db = getDummyDb();
  db.goals = (db.goals || []).map(g => {
    if (g.id === Number(id) || String(g.id) === String(id)) {
      return { ...g, ...goalData };
    }
    return g;
  });
  saveDummyDb(db);
  return db.goals.find(g => g.id === Number(id) || String(g.id) === String(id));
};

export const deleteDummyGoal = (id) => {
  const db = getDummyDb();
  db.goals = (db.goals || []).filter(g => g.id !== Number(id) && String(g.id) !== String(id));
  saveDummyDb(db);
  return { success: true };
};

export const start3HourDemoSession = ({ customerName, company, email, phone, industry, employeeSize, heardAbout }) => {
  const now = Date.now();
  const durationMs = 3 * 60 * 60 * 1000; // Exact 3 hours
  const expiresAt = now + durationMs;

  const meta = {
    isActive: true,
    is3HourDemo: true,
    customerName,
    company: company || 'My Company',
    email,
    phone,
    industry: industry || 'IT & Software',
    employeeSize: employeeSize || '21-100',
    heardAbout: heardAbout || 'Website',
    startedAt: now,
    expiresAt,
    durationMinutes: 180
  };

  localStorage.setItem(DEMO_META_KEY, JSON.stringify(meta));
  localStorage.setItem('hrms_is_demo_sandbox', 'true');
  // Initialize fresh dummy database tailored specifically to this customer and company
  initializeDummyDatabase(meta.company, customerName, true);

  return meta;
};

export const endDemoSession = () => {
  // Purge dummy storage only if expired
  purgeExpiredDemoSession();
};
