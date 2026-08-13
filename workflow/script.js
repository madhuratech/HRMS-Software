// Comprehensive HRMS Workflow Data Blueprint
const workflowData = {
  recruitment: [
    {
      step: "01",
      title: "Job Requirements Posting",
      desc: "HR managers post job descriptions, target numbers, and technical requirement parameters.",
      flow: "Frontend (Requirements List) ➔ Express backend ➔ MySQL DB",
      files: [
        { type: "View", name: "RequirementsList.jsx" },
        { type: "Route", name: "requirements.js" },
        { type: "Model", name: "madhurahrms.job_requirements" }
      ],
      tables: ["job_requirements", "departments"],
      code: `// Express Route Handler: POST /app/requirements
router.post('/requirements', authenticateJWT, async (req, res) => {
  const { title, department_id, vacancies, status } = req.body;
  const sql = 'INSERT INTO job_requirements (title, department_id, vacancies, status) VALUES (?, ?, ?, ?)';
  db.query(sql, [title, department_id, vacancies, status], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.status(201).json({ success: true, message: 'Requirement created successfully' });
  });
});`,
      preview: {
        title: "Create Job Requirement Form",
        html: `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div>
              <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:4px;">Job Title</label>
              <input type="text" value="Senior React Developer" style="width:100%; padding:8px 12px; border:1px solid #334155; background:#0f172a; color:#fff; border-radius:6px;" readonly />
            </div>
            <div>
              <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:4px;">Vacancies</label>
              <input type="number" value="3" style="width:100%; padding:8px 12px; border:1px solid #334155; background:#0f172a; color:#fff; border-radius:6px;" readonly />
            </div>
            <button style="background:#3b82f6; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:600;">Submit to Database</button>
          </div>
        `
      }
    },
    {
      step: "02",
      title: "Candidate Profile Management",
      desc: "Applicants apply for jobs. Their profiles and resumes are parsed and stored in the backend.",
      flow: "Frontend (Candidate List) ➔ Express Upload Middleware ➔ MySQL DB",
      files: [
        { type: "View", name: "CandidateProfile.jsx" },
        { type: "Route", name: "candidates.js" },
        { type: "Controller", name: "candidatesController.js" }
      ],
      tables: ["candidates", "resumes"],
      code: `// Multer storage for Resume PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/resumes'),
  filename: (req, file, cb) => cb(null, \`resume_\${Date.now()}.pdf\`)
});`,
      preview: {
        title: "Candidate Profile Dashboard View",
        html: `
          <div style="border: 1px dashed #334155; padding: 16px; border-radius: 8px; text-align: center;">
            <p style="font-weight:bold; margin-bottom: 8px;">Resume Upload Simulator</p>
            <input type="file" style="margin-bottom: 12px;" disabled />
            <div style="font-size: 11px; color: #10b981;">File path resolved: /uploads/resumes/resume_17860893.pdf</div>
          </div>
        `
      }
    }
  ],
  onboarding: [
    {
      step: "01",
      title: "Document Verification Check",
      desc: "New hires upload mandatory ID cards (Aadhaar, PAN) and educational certificates for HR verification.",
      flow: "Frontend (Document Verification) ➔ Express multer destination ➔ DB paths update",
      files: [
        { type: "View", name: "DocumentVerification.jsx" },
        { type: "Route", name: "employee.js" },
        { type: "Dir", name: "uploads/documents/" }
      ],
      tables: ["employee_documents", "employees"],
      code: `// Dynamically sanitize paths to avoid double slash prefixes:
const fileUrl = doc.file_path.startsWith('/') 
  ? doc.file_path 
  : \`/\${doc.file_path}\`;`,
      preview: {
        title: "Onboarding Document List Simulator",
        html: `
          <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
            <tr style="border-bottom:1px solid #334155; color:#94a3b8;">
              <th style="padding:6px 0;">Doc Type</th>
              <th>Uploaded Date</th>
              <th>Action</th>
            </tr>
            <tr style="border-bottom:1px solid #334155;">
              <td style="padding:8px 0; font-weight:600;">PAN Card</td>
              <td>07 Aug 2026</td>
              <td><span style="color:#3b82f6; cursor:pointer;">👁️ Preview</span></td>
            </tr>
          </table>
        `
      }
    }
  ],
  attendance: [
    {
      step: "01",
      title: "Real-time Geofenced Punching",
      desc: "Employees sign in/out via GPS geolocation coordinates verification.",
      flow: "Frontend (GPSAttendance & GeoPunch) ➔ Express route ➔ SQL Punch History",
      files: [
        { type: "View", name: "GeoPunch.jsx" },
        { type: "Route", name: "attendanceRoute.js" },
        { type: "Controller", name: "attendanceController.js" }
      ],
      tables: ["attendance"],
      code: `// Insert a geographic check-in log record
const sql = 'INSERT INTO attendance (employee_id, punch_type, latitude, longitude) VALUES (?, ?, ?, ?)';
db.query(sql, [employee_id, punch_type, lat, lng], callback);`,
      preview: {
        title: "Virtual Geo-Punch Sandbox",
        html: `
          <div style="background:#0f172a; padding:16px; border-radius:8px; text-align:center;">
            <div style="font-size:24px; font-weight:bold; margin-bottom:12px;">09:05 AM</div>
            <button id="sim-punch" style="background:#10b981; color:#fff; border:none; padding:10px 20px; border-radius:6px; font-weight:bold; cursor:pointer;">PUNCH IN (GPS)</button>
            <div id="sim-punch-log" style="font-size:11px; color:#94a3b8; margin-top:8px;">Ready to transmit coords (12.9716, 77.5946)</div>
          </div>
        `
      }
    },
    {
      step: "02",
      title: "Daily Attendance Monitoring Panel",
      desc: "Displays aggregated metrics for active staff status (Present, Late, Absent, On Leave).",
      flow: "Frontend (DailyAttendance) ➔ GET /api/attendance/daily ➔ MySQL Joined Tables",
      files: [
        { type: "View", name: "DailyAttendance.jsx" },
        { type: "Controller", name: "attendanceController.js" }
      ],
      tables: ["employees", "attendance", "leave_applications"],
      code: `// Get daily stats query with conditional status mappings
SELECT 
  e.name,
  MIN(CASE WHEN a.punch_type = 'IN' THEN a.punch_time END) as check_in,
  (SELECT COUNT(*) FROM leave_applications la WHERE la.employee_id = e.id AND la.status = 'Approved') as on_leave
FROM employees e;`,
      preview: {
        title: "Daily KPI Summary Panel",
        html: `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div style="background:#1e293b; padding:10px; border-radius:6px; text-align:center;">
              <span style="font-size:11px; color:#94a3b8;">Total Staff</span>
              <div style="font-size:20px; font-weight:bold; color:#3b82f6;">245</div>
            </div>
            <div style="background:#1e293b; padding:10px; border-radius:6px; text-align:center;">
              <span style="font-size:11px; color:#94a3b8;">Late Arrivals</span>
              <div style="font-size:20px; font-weight:bold; color:#f59e0b;">12</div>
            </div>
          </div>
        `
      }
    }
  ],
  performance: [
    {
      step: "01",
      title: "KRA and Goal Configuration",
      desc: "Setting corporate objectives, Key Result Areas (KRAs), and assigning individual performance metrics.",
      flow: "Frontend (Appraisals Panel) ➔ Express Service ➔ DB tables",
      files: [
        { type: "View", name: "PerformanceDashboard.jsx" },
        { type: "Route", name: "appraisals.js" }
      ],
      tables: ["performance_goals", "kra_parameters"],
      code: `// Insert performance scoring matrices
router.post('/goals', authenticateJWT, (req, res) => {
  const { title, weightage, target_score } = req.body;
  // insert parameters
});`,
      preview: {
        title: "Goal Matrix Allocation",
        html: `
          <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
            <div>Objective: <b>Increase Sales pipeline by 20%</b></div>
            <div style="background:#334155; height:8px; border-radius:4px; overflow:hidden;">
              <div style="background:#10b981; width:75%; height:100%;"></div>
            </div>
            <span style="color:#10b981; font-weight:bold; text-align:right;">75% Achieved</span>
          </div>
        `
      }
    }
  ],
  payroll: [
    {
      step: "01",
      title: "Salary Calculations & Payslips",
      desc: "Retrieves attendance, leaves, bonuses, deductions, and computes net pay before generating PDF slips.",
      flow: "Frontend (Payroll Manager) ➔ Express Payroll Engine ➔ PDF Stream",
      files: [
        { type: "View", name: "PayrollDashboard.jsx" },
        { type: "Route", name: "payroll.js" },
        { type: "Engine", name: "salaryCalculator.js" }
      ],
      tables: ["salary_structures", "payslips", "deductions"],
      code: `// Net salary calculation engine
const basic = structure.basic_salary;
const allowance = structure.allowances;
const deductions = structure.pf + structure.tax;
const netSalary = basic + allowance - deductions;`,
      preview: {
        title: "Paycheck Generation Preview",
        html: `
          <div style="font-size:12px; background:#1e293b; padding:12px; border-radius:6px;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #334155; padding-bottom:4px;">
              <span>Basic Earnings</span>
              <b>$4,500.00</b>
            </div>
            <div style="display:flex; justify-content:space-between; padding-top:4px;">
              <span>Tax Deductions</span>
              <span style="color:#ef4444;">-$320.00</span>
            </div>
          </div>
        `
      }
    }
  ],
  exit: [
    {
      step: "01",
      title: "Separation Settlements",
      desc: "Initiates employee resignation review, deactivates company directories, and settles exit payments.",
      flow: "Frontend (Exit Management) ➔ PATCH /employees/exits ➔ Employee table deactivation",
      files: [
        { type: "View", name: "ExitManagement.jsx" },
        { type: "Route", name: "employee.js" }
      ],
      tables: ["employee_exits", "employees"],
      code: `// Resignation settlement status update
db.query("UPDATE employees SET status = 'Terminated' WHERE id = ?", [employee_id], (err) => {
  logHistory(employee_id, "Separation", "Active", "Terminated");
});`,
      preview: {
        title: "Exit Clearance Checklist Simulator",
        html: `
          <div style="font-size:12px; display:flex; flex-direction:column; gap:8px;">
            <label><input type="checkbox" checked disabled /> Return Asset Laptop</label>
            <label><input type="checkbox" checked disabled /> Disable Company Directory Email</label>
            <label><input type="checkbox" disabled /> Final Settlement Settlement Clearance</label>
          </div>
        `
      }
    }
  ]
};

// Handle Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const stepsContainer = document.getElementById('steps-container');
const detailCard = document.getElementById('detail-card');
const previewModal = document.getElementById('preview-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');

let activeTab = 'recruitment';
let activeStepIndex = 0;

function loadSteps(tab) {
  stepsContainer.innerHTML = '';
  const steps = workflowData[tab] || [];
  
  steps.forEach((step, index) => {
    const card = document.createElement('div');
    card.className = `step-card ${index === activeStepIndex ? 'active' : ''}`;
    card.innerHTML = `
      <div class="step-header">
        <span class="step-num">Step ${step.step}</span>
        <span style="font-size:10px; color:#10b981; font-weight:bold;">Active Integration</span>
      </div>
      <h3 class="step-title">${step.title}</h3>
      <p class="step-desc">${step.desc}</p>
    `;
    
    card.addEventListener('click', () => {
      // Toggle Active step
      document.querySelectorAll('.step-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeStepIndex = index;
      loadStepDetail(tab, index);
    });
    
    stepsContainer.appendChild(card);
  });
}

function loadStepDetail(tab, index) {
  const step = workflowData[tab]?.[index];
  if (!step) {
    detailCard.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">👈</span>
        <h3>Select a lifecycle step to inspect</h3>
        <p>Explore the file mappings, database tables, and UI integrations.</p>
      </div>
    `;
    return;
  }

  const filesHtml = step.files.map(f => `
    <li>
      <span class="file-tag">${f.type}</span>
      <span>${f.name}</span>
    </li>
  `).join('');

  const tablesHtml = step.tables.map(t => `
    <li>${t}</li>
  `).join('');

  detailCard.innerHTML = `
    <div class="detail-header">
      <div class="detail-header-left">
        <h3>${step.title}</h3>
        <p>${step.desc}</p>
      </div>
      <span class="flow-direction">Lifecycle Step ${step.step}</span>
    </div>

    <div class="section-grid">
      <div class="info-block">
        <h4 class="info-title">Files & Components</h4>
        <ul class="file-list">${filesHtml}</ul>
      </div>
      <div class="info-block">
        <h4 class="info-title">Database Targets</h4>
        <ul class="table-list">${tablesHtml}</ul>
      </div>
    </div>

    <div class="info-block" style="flex:1; display:flex; flex-direction:column; gap:10px;">
      <h4 class="info-title">Backend integration (SQL Router)</h4>
      <div class="code-container" style="flex:1; display:flex; flex-direction:column;">
        <div class="code-header">
          <span class="code-title">Source Reference</span>
          <span class="code-lang">JavaScript / Node.js</span>
        </div>
        <div class="code-box">${step.code}</div>
      </div>
    </div>

    <button class="sandbox-btn" id="run-sandbox">Launch Step Sandbox Demo</button>
  `;

  // Attach sandbox button click event
  document.getElementById('run-sandbox').addEventListener('click', () => {
    openSandboxModal(step);
  });
}

function openSandboxModal(step) {
  modalTitle.innerText = `Interactive Sandbox: ${step.title}`;
  modalBody.innerHTML = `
    <p style="color:#94a3b8; font-size:13px; margin-bottom:16px;">This mock component demonstrates the real-time layout flow, dynamic bindings, and variables transmitted to the database.</p>
    <div style="background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; color:#fff;">
      ${step.preview.html}
    </div>
  `;
  
  // Attach simulation trigger within sandbox if available
  const simPunchBtn = document.getElementById('sim-punch');
  if (simPunchBtn) {
    simPunchBtn.addEventListener('click', () => {
      const log = document.getElementById('sim-punch-log');
      simPunchBtn.innerText = "Punching...";
      simPunchBtn.style.background = "#eab308";
      setTimeout(() => {
        simPunchBtn.innerText = "Punch Successful ✓";
        simPunchBtn.style.background = "#10b981";
        log.innerHTML = `<span style="color:#10b981; font-weight:bold;">POST 200 OK</span>: Coordinates logged at ${new Date().toLocaleTimeString()}`;
      }, 800);
    });
  }

  previewModal.style.display = 'flex';
}

// Close Modal Handler
closeModal.addEventListener('click', () => {
  previewModal.style.display = 'none';
});

// Click outside modal content to close
previewModal.addEventListener('click', (e) => {
  if (e.target === previewModal) {
    previewModal.style.display = 'none';
  }
});

// Setup tab navigation click actions
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.getAttribute('data-tab');
    activeStepIndex = 0;
    loadSteps(activeTab);
    loadStepDetail(activeTab, 0);
  });
});

// Init load
loadSteps('recruitment');
loadStepDetail('recruitment', 0);
