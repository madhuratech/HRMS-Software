const Openai = require("openai");
const db = require("../config/database");

let openai;

function getOpenAIClient() {
  if (!openai) {
    openai = new Openai({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return openai;
}

// Helper to wrap db.query in a Promise
function queryDB(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Helper to resolve employee name/ID to a single ID
async function resolveEmployeeId(args) {
  if (args.employee_id) {
    return { id: Number(args.employee_id), error: null };
  }
  if (args.employee_name) {
    const rows = await queryDB(`
      SELECT id, name, email FROM employees WHERE name LIKE ?
    `, [`%${args.employee_name}%`]);

    if (rows.length === 0) {
      return { id: null, error: `Employee named "${args.employee_name}" not found.` };
    }
    if (rows.length > 1) {
      return {
        id: null,
        error: `Multiple employees matched "${args.employee_name}": ${rows.map(r => `${r.name} (ID: ${r.id}, Email: ${r.email})`).join(', ')}. Please specify the exact employee ID.`
      };
    }
    return { id: rows[0].id, name: rows[0].name, error: null };
  }
  return { id: null, error: "Please provide either employee_id or employee_name." };
}

// Helper to resolve department name/ID to a single ID
async function resolveDepartmentId(args) {
  if (args.department_id) {
    return { id: Number(args.department_id), error: null };
  }
  if (args.department_name) {
    const rows = await queryDB(`
      SELECT id, dept_name FROM departments WHERE dept_name LIKE ?
    `, [`%${args.department_name}%`]);

    if (rows.length === 0) {
      return { id: null, error: `Department named "${args.department_name}" not found.` };
    }
    if (rows.length > 1) {
      return {
        id: null,
        error: `Multiple departments matched "${args.department_name}": ${rows.map(r => `${r.dept_name} (ID: ${r.id})`).join(', ')}. Please specify the exact department ID.`
      };
    }
    return { id: rows[0].id, name: rows[0].dept_name, error: null };
  }
  return { id: null, error: "Please provide either department_id or department_name." };
}

// Check if user is authorized for sensitive info (payroll)
async function isAuthorizedForPayroll(userId) {
  if (!userId) return false;
  try {
    const userRows = await queryDB(`
      SELECT r.name as role
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      WHERE e.id = ?
    `, [userId]);
    const userRole = (userRows[0]?.role || '').toUpperCase();
    return userRole === 'SUPER_ADMIN' || userRole === 'SUPER_ADMINISTRATOR' || userRole === 'HR_ADMIN' || userRole === 'HR_MANAGER';
  } catch (e) {
    console.error("Auth check failed:", e);
    return false;
  }
}

// MCP Tools definitions
const tools = [
  {
    type: "function",
    function: {
      name: "get_employees",
      description: "Get list of active employees including their basic details, department, and role.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_employee_count",
      description: "Get the total count of active employees.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_employee",
      description: "Get detailed profile information for a specific employee by ID or name.",
      parameters: {
        type: "object",
        properties: {
          employee_id: { type: "number", description: "The ID of the employee" },
          employee_name: { type: "string", description: "The name of the employee" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_employee",
      description: "Search for employees by name, email, phone, or exact employee ID code.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term (name, email, phone, or ID)" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_attendance",
      description: "Get today's daily attendance stats and lists of check-ins/outs.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_employee_attendance",
      description: "Get attendance log records for a specific employee by ID or name.",
      parameters: {
        type: "object",
        properties: {
          employee_id: { type: "number", description: "The ID of the employee" },
          employee_name: { type: "string", description: "The name of the employee" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_leave_balance",
      description: "Get remaining leave balances for a specific employee by ID or name.",
      parameters: {
        type: "object",
        properties: {
          employee_id: { type: "number", description: "The ID of the employee" },
          employee_name: { type: "string", description: "The name of the employee" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_leave_requests",
      description: "Get leave requests/applications list. Can be filtered optionally by employee ID or name.",
      parameters: {
        type: "object",
        properties: {
          employee_id: { type: "number", description: "Optional employee ID to filter applications" },
          employee_name: { type: "string", description: "Optional employee name to filter applications" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_departments",
      description: "Get list of all HR departments.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_department_employees",
      description: "Get list of employees in a department by its ID or name.",
      parameters: {
        type: "object",
        properties: {
          department_id: { type: "number" },
          department_name: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_designations",
      description: "Get list of designations/roles available in the organization.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_holidays",
      description: "Get list of company holidays. Note: This reports setup context when DB doesn't have a holiday table.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_payroll_summary",
      description: "Get payroll summary details (requires admin role authorization).",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_employee_payroll",
      description: "Get salary slips / payroll details for a specific employee ID or name (requires authorization).",
      parameters: {
        type: "object",
        properties: {
          employee_id: { type: "number" },
          employee_name: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_job_positions",
      description: "Get list of current job position vacancies and requirements.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_candidates",
      description: "Get list of recruitment candidates and applicants.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_interview_schedules",
      description: "Get list of scheduled candidate interviews.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_company_profile",
      description: "Get official organization profiles, contact, shift policies and settings.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_projects",
      description: "Get list of project boards.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_tasks",
      description: "Get list of project tasks.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_support_tickets",
      description: "Get list of support tickets filed by employees.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for current or external information (e.g. latest version of software, today's news, current exchange rates, weather, general information that needs current data).",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The web search query string." }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Evaluate math calculations accurately (e.g. basic arithmetic, percentages, multiplications).",
      parameters: {
        type: "object",
        properties: {
          expression: { type: "string", description: "The mathematical expression to calculate (e.g. '125 * 48')." }
        },
        required: ["expression"]
      }
    }
  }
];

// Execute actual DB queries corresponding to tool calls
async function executeTool(name, args, userId) {
  let result;
  let summary = "";

  // Authorization checks
  if (name === "get_payroll_summary" || name === "get_employee_payroll") {
    const authorized = await isAuthorizedForPayroll(userId);
    if (!authorized) {
      throw new Error("Forbidden: Insufficient permissions to view sensitive payroll or salary data.");
    }
  }

  switch (name) {
    case "get_employees": {
      const rows = await queryDB(`
        SELECT e.id, e.name, e.email, e.phone, e.status, dept.dept_name as department, desg.role_name as role
        FROM employees e
        LEFT JOIN departments dept ON e.department_id = dept.id
        LEFT JOIN designations desg ON e.designation_id = desg.id
        WHERE e.status = 'Active'
      `);
      result = rows;
      summary = `Fetched active employees list (${rows.length} records)`;
      break;
    }
    case "get_employee_count": {
      const rows = await queryDB("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'");
      result = { count: rows[0].count };
      summary = `Fetched total count of active employees (${rows[0].count})`;
      break;
    }
    case "get_employee": {
      const { id, error } = await resolveEmployeeId(args);
      if (error) {
        result = { error };
        summary = error;
        break;
      }
      const rows = await queryDB(`
        SELECT e.id, e.name, e.email, e.phone, e.dob, e.join_date, e.status, e.gender, e.employment_type, e.salary, e.address,
               b.branch_name, dept.dept_name as department, desg.role_name as role, m.name as manager_name
        FROM employees e
        LEFT JOIN branches b ON e.branch_id = b.id
        LEFT JOIN departments dept ON e.department_id = dept.id
        LEFT JOIN designations desg ON e.designation_id = desg.id
        LEFT JOIN employees m ON e.manager_id = m.id
        WHERE e.id = ?
      `, [id]);
      result = rows[0] || null;
      summary = result ? `Fetched details for employee ID ${id}` : `Employee ID ${id} not found`;
      break;
    }
    case "search_employee": {
      const q = `%${args.query}%`;
      const rows = await queryDB(`
        SELECT e.id, e.name, e.email, e.phone, e.status, dept.dept_name as department, desg.role_name as role
        FROM employees e
        LEFT JOIN departments dept ON e.department_id = dept.id
        LEFT JOIN designations desg ON e.designation_id = desg.id
        WHERE e.name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR CONCAT('EMP00', e.id) = ?
      `, [q, q, q, args.query]);
      result = rows;
      summary = `Searched employees with query "${args.query}" (${rows.length} matches)`;
      break;
    }
    case "get_attendance": {
      const rows = await queryDB(`
        SELECT e.name, a.punch_type, a.punch_time
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE DATE(a.punch_time) = CURDATE()
        ORDER BY a.punch_time DESC
      `);
      result = rows;
      summary = `Fetched today's attendance logs (${rows.length} entries)`;
      break;
    }
    case "get_employee_attendance": {
      const { id, error } = await resolveEmployeeId(args);
      if (error) {
        result = { error };
        summary = error;
        break;
      }
      const rows = await queryDB(`
        SELECT punch_type, punch_time
        FROM attendance
        WHERE employee_id = ?
        ORDER BY punch_time DESC
        LIMIT 20
      `, [id]);
      result = rows;
      summary = `Fetched attendance history for employee ID ${id} (${rows.length} entries)`;
      break;
    }
    case "get_leave_balance": {
      const { id, error } = await resolveEmployeeId(args);
      if (error) {
        result = { error };
        summary = error;
        break;
      }
      const rows = await queryDB(`
        SELECT lb.days_remaining, lt.name as leave_name, lt.code as leave_code
        FROM leave_balances lb
        JOIN leave_types lt ON lb.leave_type_id = lt.id
        WHERE lb.employee_id = ?
      `, [id]);
      result = rows;
      summary = `Fetched leave balances for employee ID ${id}`;
      break;
    }
    case "get_leave_requests": {
      let id = null;
      if (args.employee_id || args.employee_name) {
        const { id: resolvedId, error } = await resolveEmployeeId(args);
        if (error) {
          result = { error };
          summary = error;
          break;
        }
        id = resolvedId;
      }
      let sql = `
        SELECT la.id, la.start_date, la.end_date, la.reason, la.status, e.name as employee_name, lt.name as leave_name
        FROM leave_applications la
        JOIN employees e ON la.employee_id = e.id
        JOIN leave_types lt ON la.leave_type_id = lt.id
      `;
      const params = [];
      if (id) {
        sql += " WHERE la.employee_id = ?";
        params.push(id);
      }
      sql += " ORDER BY la.applied_on DESC LIMIT 30";
      const rows = await queryDB(sql, params);
      result = rows;
      summary = `Fetched leave applications list (${rows.length} records)`;
      break;
    }
    case "get_departments": {
      const rows = await queryDB("SELECT id, dept_name FROM departments ORDER BY dept_name");
      result = rows;
      summary = `Fetched departments list (${rows.length} records)`;
      break;
    }
    case "get_department_employees": {
      const { id, error } = await resolveDepartmentId(args);
      if (error) {
        result = { error };
        summary = error;
        break;
      }
      const rows = await queryDB(`
        SELECT e.id, e.name, e.email, e.phone, e.status, desg.role_name as role
        FROM employees e
        LEFT JOIN designations desg ON e.designation_id = desg.id
        WHERE e.department_id = ?
      `, [id]);
      result = rows;
      summary = `Fetched employees in department ID ${id} (${rows.length} records)`;
      break;
    }
    case "get_designations": {
      const rows = await queryDB("SELECT id, role_code, role_name FROM designations ORDER BY role_name");
      result = rows;
      summary = `Fetched designations list (${rows.length} records)`;
      break;
    }
    case "get_holidays": {
      // Holidays are frontend-only, let's inform the model clearly
      result = {
        message: "Holidays are configured on the frontend only. No holidays database table exists in this installation.",
        holidays: [
          { date: '01 Jan 2026', day: 'Thu', name: 'New Year', occasion: 'New Year Celebration', location: 'All', type: 'Gazetted', status: 'Active' },
          { date: '26 Jan 2026', day: 'Mon', name: 'Republic Day', occasion: 'National Holiday', location: 'All', type: 'Gazetted', status: 'Active' },
          { date: '15 Aug 2026', day: 'Sat', name: 'Independence Day', occasion: 'National Holiday', location: 'All', type: 'Gazetted', status: 'Active' },
          { date: '02 Oct 2026', day: 'Fri', name: 'Gandhi Jayanti', occasion: 'National Holiday', location: 'All', type: 'Gazetted', status: 'Active' },
          { date: '25 Dec 2026', day: 'Fri', name: 'Christmas', occasion: 'Christian Festival', location: 'All', type: 'Optional', status: 'Active' }
        ]
      };
      summary = "Holidays list (resolved from static frontend holiday configurations)";
      break;
    }
    case "get_payroll_summary": {
      const runs = await queryDB("SELECT * FROM payroll_runs ORDER BY period_year DESC, period_month DESC LIMIT 10");
      const stats = await queryDB("SELECT SUM(net_salary) as total_payout, COUNT(*) as payslips_count FROM payslips");
      result = { runs, stats: stats[0] };
      summary = `Fetched payroll summary stats (${runs.length} runs)`;
      break;
    }
    case "get_employee_payroll": {
      const { id, error } = await resolveEmployeeId(args);
      if (error) {
        result = { error };
        summary = error;
        break;
      }
      const rows = await queryDB(`
        SELECT p.*, r.period_month, r.period_year
        FROM payslips p
        JOIN payroll_runs r ON p.payroll_run_id = r.id
        WHERE p.employee_id = ?
        ORDER BY r.period_year DESC, r.period_month DESC
      `, [id]);
      result = rows;
      summary = `Fetched payslip history for employee ID ${id} (${rows.length} records)`;
      break;
    }
    case "get_job_positions": {
      const rows = await queryDB(`
        SELECT r.*, d.dept_name as department, des.role_name as designation
        FROM requirements r
        LEFT JOIN departments d ON r.department_id = d.id
        LEFT JOIN designations des ON r.designation_id = des.id
        WHERE r.deleted_at IS NULL
        ORDER BY r.created_at DESC
      `);
      result = rows;
      summary = `Fetched job positions vacancies (${rows.length} open/draft requirements)`;
      break;
    }
    case "get_candidates": {
      const rows = await queryDB(`
        SELECT c.*, d.dept_name as department
        FROM candidates c
        LEFT JOIN departments d ON c.department_id = d.id
        ORDER BY c.created_at DESC
      `);
      result = rows;
      summary = `Fetched candidates list (${rows.length} applicants)`;
      break;
    }
    case "get_interview_schedules": {
      const rows = await queryDB(`
        SELECT i.*, c.candidate_name, e.name as interviewer_name
        FROM interview_schedules i
        JOIN candidates c ON i.candidate_id = c.id
        JOIN employees e ON i.interviewer_id = e.id
        ORDER BY i.interview_date DESC, i.interview_time DESC
      `);
      result = rows;
      summary = `Fetched interview schedules (${rows.length} entries)`;
      break;
    }
    case "get_company_profile": {
      const rows = await queryDB("SELECT * FROM company_profile LIMIT 1");
      result = rows[0] || null;
      summary = result ? `Fetched profile settings for "${result.company_name}"` : "Company profile settings not found";
      break;
    }
    case "get_projects": {
      const rows = await queryDB("SELECT * FROM projects ORDER BY start_date DESC");
      result = rows;
      summary = `Fetched active projects (${rows.length} boards)`;
      break;
    }
    case "get_tasks": {
      const rows = await queryDB(`
        SELECT t.*, p.name as project_name, e.name as assignee_name
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        LEFT JOIN employees e ON t.assignee_id = e.id
        ORDER BY t.due_date DESC
      `);
      result = rows;
      summary = `Fetched sprint tasks (${rows.length} items)`;
      break;
    }
    case "get_support_tickets": {
      const rows = await queryDB(`
        SELECT t.*, e.name as employee_name, cat.name as category, pri.name as priority
        FROM tickets t
        JOIN employees e ON t.employee_id = e.id
        LEFT JOIN ticket_categories cat ON t.category_id = cat.id
        LEFT JOIN ticket_priorities pri ON t.priority_id = pri.id
        ORDER BY t.created_at DESC
      `);
      result = rows;
      summary = `Fetched help desk support tickets (${rows.length} reports)`;
      break;
    }
    case "web_search": {
      const { query } = args;
      const searchResults = await performWebSearch(query);
      result = searchResults;
      summary = `Searched web for "${query}" (${searchResults.length} results)`;
      break;
    }
    case "calculator": {
      const { expression } = args;
      try {
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
          throw new Error("Invalid characters in math expression");
        }
        const evalResult = Function(`"use strict"; return (${expression})`)();
        result = { expression, result: evalResult };
        summary = `Calculated expression "${expression}" = ${evalResult}`;
      } catch (err) {
        result = { expression, error: err.message };
        summary = `Failed to calculate expression "${expression}": ${err.message}`;
      }
      break;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }

  return { result, summary };
}

// Main generation function executing OpenAI tool calling flow with conversation memory
async function generateResponse(message, conversationId, userId) {
  const client = getOpenAIClient();

  // 1. Ensure conversation exists
  const convs = await queryDB("SELECT id FROM ai_conversations WHERE conversation_id = ?", [conversationId]);
  if (convs.length === 0) {
    // Generate simple title from user message
    let title = message.trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }
    await queryDB(
      "INSERT INTO ai_conversations (conversation_id, user_id, title) VALUES (?, ?, ?)",
      [conversationId, userId, title]
    );
  }

  // 2. Save User Message to DB
  await queryDB(
    "INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, 'user', ?)",
    [conversationId, message]
  );

  // Helper classifiers for deterministic routing
  const isHRMS = isHRMSQuestion(message);
  const isCurrent = requiresCurrentInformation(message);
  const isMath = isCalculation(message);

  if (isHRMS) {
    console.log(`[AI ROUTER]\nQuestion: ${message}\nRoute: HRMS_MCP`);
  } else if (isCurrent) {
    console.log(`[AI ROUTER]\nQuestion: ${message}\nRoute: WEB_SEARCH`);
    console.log(`[WEB SEARCH]\nQuery: ${message}`);
    const searchResults = await performWebSearch(message);
    console.log(`[WEB SEARCH]\nResults: ${JSON.stringify(searchResults)}`);
    console.log(`[AI]\nGenerating answer using web results`);

    const systemPrompt = `You are the AI HR Assistant. Answer the user's current/external question using the provided web search results.
Always prioritize the live web search results over your internal training data.
If the search results do not contain the answer, say you don't know rather than speculating.
Web Search Results:
${JSON.stringify(searchResults)}`;

    const response = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 4096
    });

    const replyText = response.choices[0].message.content || '';
    const { cleanText, suggestions } = parseSuggestionsFromText(replyText);

    // Save final response to DB
    await queryDB(
      "INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, 'assistant', ?)",
      [conversationId, cleanText]
    );

    return {
      text: cleanText,
      toolUsed: {
        name: "Web Search Tool",
        status: "Success",
        description: `Searched web for "${message}"`
      },
      structuredData: { type: 'web_answer', query: message, results: searchResults },
      suggestions
    };
  } else if (isMath) {
    console.log(`[AI ROUTER]\nQuestion: ${message}\nRoute: CALCULATOR`);
    const expr = message.replace(/calculate/i, '').trim();
    let val;
    try {
      val = Function(`"use strict"; return (${expr})`)();
      console.log(`[CALCULATOR]\nExpression: ${expr} = ${val}`);
    } catch (e) {
      val = `Error: ${e.message}`;
    }

    const systemPrompt = `You are the AI HR Assistant. Explain this math calculation result to the user:
Expression: ${expr}
Result: ${val}`;

    const response = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 4096
    });

    const replyText = response.choices[0].message.content || '';
    const { cleanText, suggestions } = parseSuggestionsFromText(replyText);

    await queryDB(
      "INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, 'assistant', ?)",
      [conversationId, cleanText]
    );

    return {
      text: cleanText,
      toolUsed: {
        name: "Calculator Tool",
        status: "Success",
        description: `Calculated ${expr} = ${val}`
      },
      structuredData: { type: 'theory', calculation: { expression: expr, result: val } },
      suggestions
    };
  } else {
    console.log(`[AI ROUTER]\nQuestion: ${message}\nRoute: DIRECT_LLM`);
  }

  // 3. Load previous messages from DB (limit 30)
  const dbMessages = await queryDB(`
    SELECT role, content, tool_name, tool_call_id FROM (
      SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 30
    ) sub ORDER BY id ASC
  `, [conversationId]);

  // 4. Map DB messages to OpenRouter compatible format
  const messages = [
    {
      role: "system",
      content: `You are the AI HR Assistant for a human resource management system (HRMS).
You answer questions related to employees, leave management, attendance, payroll, departments, designations, holidays, recruitment, projects, and company information, as well as general and external questions.

ROUTING RULES — follow these strictly:
1. HRMS DATABASE / real data queries ("Who is absent today?", "Show employees", "Super Admin leave balance", "What holidays are available?"):
   → You MUST use the appropriate HRMS database/MCP tools. Do NOT use web search. Never guess or invent numbers or names.
2. CURRENT / TIME-SENSITIVE / EXTERNAL queries (any query containing/implying "current", "today", "latest", "now", "present", "this year", "recent", "who is the current", "what is the latest", "today's news", "current CM", "current PM", "current government", "current weather", "latest version", or external facts that can change over time like "Who is the Tamil Nadu CM?"):
   → You MUST call the "web_search" tool first to get live, up-to-date data. NEVER answer these directly from your training memory.
3. GENERAL NON-CURRENT / EDUCATIONAL queries ("What is AI?", "What is React?", "What is an API?"):
   → Answer directly from your knowledge base. Do NOT use web_search.
4. MATHEMATICAL / CALCULATION queries ("Calculate 125 * 48", "125 * 48"):
   → Use the "calculator" tool to compute.
5. CASUAL / CONVERSATIONAL queries ("Saptiya?", "Hi", "How are you?"):
   → Respond directly in a friendly manner. Do NOT call any tools.

TOOL RULES:
- You may chain multiple tool calls if needed.
- Max 5 tool iterations per response.
- If a query returns no results, state that clearly.

CONVERSATION MEMORY:
- Use previous messages to interpret follow-ups.
- Resolve short inputs ("yes", "casual leave", etc.) using context.

FOLLOW-UP SUGGESTIONS:
After answering a DATA or WEB question (when you used a tool), append this JSON suffix to your final text response:
SUGGESTIONS:["suggestion 1","suggestion 2","suggestion 3"]`
    }
  ];

  for (const msg of dbMessages) {
    if (msg.role === 'assistant' && msg.tool_call_id) {
      messages.push({
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: msg.tool_call_id,
            type: 'function',
            function: {
              name: msg.tool_name,
              arguments: msg.content
            }
          }
        ]
      });
    } else if (msg.role === 'tool') {
      messages.push({
        role: 'tool',
        name: msg.tool_name,
        tool_call_id: msg.tool_call_id,
        content: msg.content
      });
    } else {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
  }

  let toolUsed = null;
  let structuredData = null; // holds typed result for rich frontend rendering
  const MAX_TOOL_ITERATIONS = 5;

  for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
    const response = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 4096
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      // Save assistant tool call intent to DB
      for (const toolCall of responseMessage.tool_calls) {
        await queryDB(
          "INSERT INTO ai_messages (conversation_id, role, content, tool_name, tool_call_id) VALUES (?, 'assistant', ?, ?, ?)",
          [conversationId, toolCall.function.arguments, toolCall.function.name, toolCall.id]
        );
      }

      // Add to messages memory
      messages.push(responseMessage);

      // Execute all tool calls
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        let functionArgs = {};
        try {
          functionArgs = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          console.error("Error parsing function arguments:", e);
        }

        const toolTitles = {
          get_employees: "Employee List Tool",
          get_employee_count: "Employee Count Tool",
          get_employee: "Employee Detail Tool",
          search_employee: "Employee Search Tool",
          get_attendance: "Attendance Tool",
          get_employee_attendance: "Attendance Detail Tool",
          get_leave_balance: "Leave Balance Tool",
          get_leave_requests: "Leave Request Tool",
          get_departments: "Department Tool",
          get_department_employees: "Department Employees Tool",
          get_designations: "Designation Tool",
          get_holidays: "Holiday Tool",
          get_payroll_summary: "Payroll Summary Tool",
          get_employee_payroll: "Employee Payroll Tool",
          get_job_positions: "Recruitment Vacancy Tool",
          get_candidates: "Candidate Applicants Tool",
          get_interview_schedules: "Interview Schedule Tool",
          get_company_profile: "Company Profile Tool",
          get_projects: "Project Boards Tool",
          get_tasks: "Sprint Tasks Tool",
          get_support_tickets: "Support Helpdesk Tool",
          web_search: "Web Search Tool",
          calculator: "Calculator Tool"
        };

        try {
          const { result, summary } = await executeTool(functionName, functionArgs, userId);

          toolUsed = {
            name: toolTitles[functionName] || functionName,
            status: "Success",
            description: summary
          };

          // ─── Full structured data mapping for all MCP tools ──────────────────
          if (functionName === 'get_employees' && Array.isArray(result)) {
            structuredData = { type: 'employee_list', employees: result };
          } else if (functionName === 'get_employee' && result && !result.error) {
            structuredData = { type: 'employee_profile', employee: result };
          } else if ((functionName === 'search_employee' || functionName === 'get_employee_count') && result && !result.error) {
            // search_employee may return an array; single result becomes a profile
            if (Array.isArray(result) && result.length === 1) {
              structuredData = { type: 'employee_profile', employee: result[0] };
            } else if (Array.isArray(result) && result.length > 1) {
              structuredData = { type: 'employee_list', employees: result };
            }
          } else if (functionName === 'get_attendance' && Array.isArray(result)) {
            structuredData = { type: 'attendance_summary', attendance: result };
          } else if (functionName === 'get_employee_attendance' && Array.isArray(result)) {
            structuredData = { type: 'employee_attendance', attendance: result, employee_name: functionArgs.employee_name };
          } else if (functionName === 'get_leave_balance' && Array.isArray(result)) {
            structuredData = { type: 'leave_balance', balances: result, employee_name: functionArgs.employee_name || String(functionArgs.employee_id || '') };
          } else if (functionName === 'get_leave_requests' && Array.isArray(result)) {
            structuredData = { type: 'leave_request_list', requests: result };
          } else if (functionName === 'get_departments' && Array.isArray(result)) {
            structuredData = { type: 'department_list', departments: result };
          } else if (functionName === 'get_department_employees' && Array.isArray(result)) {
            structuredData = { type: 'department_employees', employees: result, department_name: functionArgs.department_name };
          } else if (functionName === 'get_designations' && Array.isArray(result)) {
            structuredData = { type: 'designation_list', designations: result };
          } else if (functionName === 'get_holidays' && result) {
            structuredData = { type: 'holiday_list', holidays: Array.isArray(result) ? result : (result.holidays || []) };
          } else if (functionName === 'get_payroll_summary' && result) {
            structuredData = { type: 'payroll_summary', summary: result };
          } else if (functionName === 'get_employee_payroll' && Array.isArray(result)) {
            structuredData = { type: 'employee_payroll', payroll: result, employee_name: functionArgs.employee_name };
          } else if (functionName === 'get_job_positions' && Array.isArray(result)) {
            structuredData = { type: 'job_positions', positions: result };
          } else if (functionName === 'get_candidates' && Array.isArray(result)) {
            structuredData = { type: 'candidates', candidates: result };
          } else if (functionName === 'get_interview_schedules' && Array.isArray(result)) {
            structuredData = { type: 'interview_schedules', schedules: result };
          } else if (functionName === 'get_company_profile' && result) {
            structuredData = { type: 'company_profile', profile: result };
          } else if (functionName === 'get_projects' && Array.isArray(result)) {
            structuredData = { type: 'projects', projects: result };
          } else if (functionName === 'get_tasks' && Array.isArray(result)) {
            structuredData = { type: 'tasks', tasks: result };
          } else if (functionName === 'get_support_tickets' && Array.isArray(result)) {
            structuredData = { type: 'support_tickets', tickets: result };
          } else if (functionName === 'web_search' && Array.isArray(result)) {
            structuredData = { type: 'web_answer', query: functionArgs.query, results: result };
          } else if (functionName === 'calculator' && result) {
            structuredData = { type: 'theory', calculation: result };
          }

          // Save tool result to DB
          await queryDB(
            "INSERT INTO ai_messages (conversation_id, role, content, tool_name, tool_call_id) VALUES (?, 'tool', ?, ?, ?)",
            [conversationId, JSON.stringify(result), functionName, toolCall.id]
          );

          // Add to messages memory
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: functionName,
            content: JSON.stringify(result)
          });

        } catch (toolError) {
          console.error("Error executing tool:", toolError);
          toolUsed = {
            name: toolTitles[functionName] || functionName,
            status: "Failed",
            description: `Failed to query: ${toolError.message}`
          };

          // Save failed tool result to DB
          await queryDB(
            "INSERT INTO ai_messages (conversation_id, role, content, tool_name, tool_call_id) VALUES (?, 'tool', ?, ?, ?)",
            [conversationId, JSON.stringify({ error: toolError.message }), functionName, toolCall.id]
          );

          // Add to messages memory
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: functionName,
            content: JSON.stringify({ error: toolError.message })
          });
        }
      }
    } else {
      // Parse suggestions from the LLM text if present
      const { cleanText: rawText, suggestions: rawSugs } = parseSuggestionsFromText(responseMessage.content || '');

      // Save assistant final response to DB (save clean text)
      await queryDB(
        "INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, 'assistant', ?)",
        [conversationId, rawText]
      );

      return {
        text: rawText,
        toolUsed,
        structuredData,
        suggestions: rawSugs
      };
    }
  }

  // Fallback if loop ends
  const finalResponse = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    messages,
    max_tokens: 4096
  });

  // Save final fallback response to DB
  const { cleanText: fbText, suggestions: fbSugs } = parseSuggestionsFromText(finalResponse.choices[0].message.content || '');
  await queryDB(
    "INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, 'assistant', ?)",
    [conversationId, fbText]
  );

  return {
    text: fbText,
    toolUsed,
    structuredData,
    suggestions: fbSugs
  };
}

// Helper to extract follow-up suggestions from LLM text suffix
function parseSuggestionsFromText(text) {
  const marker = 'SUGGESTIONS:';
  const idx = text.lastIndexOf(marker);
  if (idx === -1) return { cleanText: text.trim(), suggestions: [] };
  try {
    const rawJson = text.slice(idx + marker.length).trim();
    const suggestions = JSON.parse(rawJson);
    const cleanText = text.slice(0, idx).trim();
    return { cleanText, suggestions: Array.isArray(suggestions) ? suggestions : [] };
  } catch {
    return { cleanText: text.trim(), suggestions: [] };
  }
}

// Helper to perform live DuckDuckGo HTML web search
async function performWebSearch(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) throw new Error(`DuckDuckGo request failed: ${response.status}`);
    const html = await response.text();

    const results = [];
    const regex = /<a class="result__snippet"\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while ((match = regex.exec(html)) !== null && results.length < 5) {
      let rawUrl = match[1];
      let title = match[2].replace(/<[^>]*>/g, '').trim();
      
      let cleanUrl = rawUrl;
      if (rawUrl.includes('uddg=')) {
        const parts = rawUrl.split('uddg=');
        if (parts[1]) {
          const encUrl = parts[1].split('&')[0];
          cleanUrl = decodeURIComponent(encUrl);
        }
      } else if (rawUrl.startsWith('//')) {
        cleanUrl = 'https:' + rawUrl;
      }
      
      results.push({ title, url: cleanUrl });
    }

    return results;
  } catch (error) {
    console.error("Web search error:", error);
    return [{ title: `Failed to search the web: ${error.message}`, url: 'https://duckduckgo.com' }];
  }
}

function isHRMSQuestion(message) {
  const m = message.toLowerCase();
  const hrmsKeywords = [
    'employee', 'absent', 'attendance', 'leave', 'holiday',
    'payroll', 'payslip', 'salary', 'designation', 'department',
    'candidate', 'recruitment', 'interview', 'timesheet',
    'sprint', 'task', 'project', 'support ticket', 'ticket'
  ];
  return hrmsKeywords.some(k => m.includes(k));
}

function requiresCurrentInformation(message) {
  const m = message.toLowerCase();
  const keywords = [
    'current', 'today', 'latest', 'now', 'present', 'this year',
    'who is the current', 'what is the latest', 'recent',
    'recent news', "today's news", 'current government',
    'current minister', 'current cm', 'current pm', 'current president',
    'current price', 'current weather', 'latest version', 'latest release',
    'yesterday', 'tomorrow'
  ];
  if (isHRMSQuestion(message)) {
    return false;
  }
  return keywords.some(k => m.includes(k)) || m.includes('cm') || m.includes('pm') || m.includes('minister') || m.includes('president') || m.includes('news');
}

function isCalculation(message) {
  const m = message.replace(/calculate/i, '').trim();
  return /^[0-9+\-*/().\s]+$/.test(m) && /[\+\-\*\/]/.test(m);
}

module.exports = { generateResponse };
