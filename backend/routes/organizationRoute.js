const express = require("express");
const router = express.Router();
const db = require("../config/database");

/**
 * GET ALL DEPARTMENTS
 */
router.get("/departments", (req, res) => {
  const sql = `
    SELECT 
      d.id,
      d.dept_name as name,
      d.dept_name as code,
      e.name as headName,
      d.manager_id
    FROM departments d
    LEFT JOIN employees e ON d.manager_id = e.id
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/**
 * CREATE DEPARTMENT
 */
router.post("/departments", (req, res) => {
  const { name, manager_id } = req.body;
  const sql = "INSERT INTO departments (dept_name, manager_id) VALUES (?, ?)";
  db.query(sql, [name, manager_id || null], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Department created successfully", id: result.insertId });
  });
});

/**
 * GET ALL DESIGNATIONS
 */
router.get("/designations", (req, res) => {
  const sql = `
    SELECT 
      id,
      role_name as name,
      role_code as code
    FROM designations
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/**
 * CREATE DESIGNATION
 */
router.post("/designations", (req, res) => {
  const { name, code } = req.body;
  const sql = "INSERT INTO designations (role_name, role_code) VALUES (?, ?)";
  db.query(sql, [name, code], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Designation created successfully", id: result.insertId });
  });
});

const PDFDocument = require("pdfkit");

function mapRowToProfile(row) {
  return {
    general: {
      companyName: row.company_name,
      legalCompanyName: row.legal_company_name,
      companyCode: row.company_code,
      companyType: row.company_type,
      industry: row.industry,
      businessType: row.business_type,
      yearEstablished: row.year_established,
      numberOfEmployees: row.number_of_employees,
      financialYear: row.financial_year
    },
    contact: {
      officialEmail: row.official_email,
      hrEmail: row.hr_email,
      supportEmail: row.support_email,
      website: row.website,
      phoneNumber: row.phone_number,
      mobileNumber: row.mobile_number,
      alternateNumber: row.alternate_number,
      faxNumber: row.fax_number,
      linkedinUrl: row.linkedin_url,
      facebookUrl: row.facebook_url,
      twitterUrl: row.twitter_url,
      instagramUrl: row.instagram_url
    },
    address: {
      headOfficeAddress1: row.head_office_address1,
      headOfficeAddress2: row.head_office_address2,
      headOfficeLandmark: row.head_office_landmark,
      headOfficeCity: row.head_office_city,
      headOfficeState: row.head_office_state,
      headOfficeCountry: row.head_office_country,
      headOfficeZipCode: row.head_office_zip_code,
      headOfficeGoogleMapsUrl: row.head_office_google_maps_url,
      branchName: row.branch_name,
      branchAddress: row.branch_address,
      branchCity: row.branch_city,
      branchState: row.branch_state,
      branchCountry: row.branch_country,
      branchZipCode: row.branch_zip_code
    },
    business: {
      gstNumber: row.gst_number,
      panNumber: row.pan_number,
      cinNumber: row.cin_number,
      tanNumber: row.tan_number,
      msmeNumber: row.msme_number,
      iecCode: row.iec_code,
      pfRegistrationNumber: row.pf_registration_number,
      esiRegistrationNumber: row.esi_registration_number,
      professionalTaxNumber: row.professional_tax_number,
      labourLicenseNumber: row.labour_license_number,
      shopEstablishmentNumber: row.shop_establishment_number
    },
    hrSettings: {
      employeeIdPrefix: row.employee_id_prefix,
      autoGenerateEmployeeId: row.auto_generate_employee_id,
      defaultDepartment: row.default_department,
      defaultDesignation: row.default_designation,
      probationPeriod: row.probation_period,
      noticePeriod: row.notice_period,
      defaultShift: row.default_shift,
      workingDays: row.working_days,
      weekendPolicy: row.weekend_policy,
      attendanceMethod: row.attendance_method,
      biometricEnabled: Boolean(row.biometric_enabled),
      overtimeEnabled: Boolean(row.overtime_enabled),
      leaveCarryForward: Boolean(row.leave_carry_forward)
    },
    payroll: {
      payrollFrequency: row.payroll_frequency,
      salaryCycle: row.salary_cycle,
      salaryPaymentDate: row.salary_payment_date,
      basicSalaryPct: row.basic_salary_pct,
      hraPct: row.hra_pct,
      pfEnabled: Boolean(row.pf_enabled),
      esiEnabled: Boolean(row.esi_enabled),
      professionalTax: Boolean(row.professional_tax),
      tdsEnabled: Boolean(row.tds_enabled),
      bonusEnabled: Boolean(row.bonus_enabled),
      gratuityEnabled: Boolean(row.gratuity_enabled),
      payrollApproval: row.payroll_approval
    },
    banking: {
      bankName: row.bank_name,
      branchName: row.bank_branch_name,
      accountHolderName: row.account_holder_name,
      accountNumber: row.account_number,
      confirmAccountNumber: row.confirm_account_number,
      ifscCode: row.ifsc_code,
      swiftCode: row.swift_code,
      micrCode: row.micr_code,
      upiId: row.upi_id,
      salaryPaymentMethod: row.salary_payment_method
    },
    branding: {
      companyThemeColor: row.company_theme_color,
      secondaryThemeColor: row.secondary_theme_color,
      companyLogoName: row.company_logo_name,
      faviconName: row.favicon_name,
      loginBgName: row.login_bg_name,
      dashboardBannerName: row.dashboard_banner_name,
      emailHeaderLogoName: row.email_header_logo_name,
      emailFooterLogoName: row.email_footer_logo_name,
      companySealName: row.company_seal_name,
      digitalSignatureName: row.digital_signature_name
    },
    documents: row.documents ? JSON.parse(row.documents) : {
      gstCertificate: null,
      panCard: null,
      cinCertificate: null,
      incorporationCertificate: null,
      pfCertificate: null,
      esiCertificate: null,
      labourLicense: null,
      isoCertificate: null,
      companyPolicies: null,
      employeeHandbook: null
    },
    systemSettings: {
      language: row.language,
      timeZone: row.time_zone,
      currency: row.currency,
      dateFormat: row.date_format,
      timeFormat: row.time_format,
      passwordPolicy: row.password_policy,
      twoFactorAuthentication: Boolean(row.two_factor_authentication),
      sessionTimeout: row.session_timeout,
      loginAttempts: row.login_attempts,
      emailNotification: Boolean(row.email_notification),
      smsNotification: Boolean(row.sms_notification),
      pushNotification: Boolean(row.push_notification),
      smtp: row.smtp,
      smsGateway: row.sms_gateway,
      googleWorkspace: row.google_workspace,
      microsoft365: row.microsoft_365,
      biometricDevice: row.biometric_device
    }
  };
}

/**
 * GET COMPANY PROFILE
 */
router.get("/profile", (req, res) => {
  const sql = "SELECT * FROM company_profile WHERE id = 1";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch profile", details: err });
    if (rows.length === 0) return res.status(404).json({ error: "Company profile not found" });
    res.json(mapRowToProfile(rows[0]));
  });
});

/**
 * UPDATE COMPANY PROFILE
 */
router.put("/profile", (req, res) => {
  const p = req.body;
  const sql = `
    UPDATE company_profile
    SET 
      company_name = ?, legal_company_name = ?, company_code = ?, company_type = ?, industry = ?, business_type = ?, year_established = ?, number_of_employees = ?, financial_year = ?,
      official_email = ?, hr_email = ?, support_email = ?, website = ?, phone_number = ?, mobile_number = ?, alternate_number = ?, fax_number = ?, linkedin_url = ?, facebook_url = ?, twitter_url = ?, instagram_url = ?,
      head_office_address1 = ?, head_office_address2 = ?, head_office_landmark = ?, head_office_city = ?, head_office_state = ?, head_office_country = ?, head_office_zip_code = ?, head_office_google_maps_url = ?, branch_name = ?, branch_address = ?, branch_city = ?, branch_state = ?, branch_country = ?, branch_zip_code = ?,
      gst_number = ?, pan_number = ?, cin_number = ?, tan_number = ?, msme_number = ?, iec_code = ?, pf_registration_number = ?, esi_registration_number = ?, professional_tax_number = ?, labour_license_number = ?, shop_establishment_number = ?,
      employee_id_prefix = ?, auto_generate_employee_id = ?, default_department = ?, default_designation = ?, probation_period = ?, notice_period = ?, default_shift = ?, working_days = ?, weekend_policy = ?, attendance_method = ?, biometric_enabled = ?, overtime_enabled = ?, leave_carry_forward = ?,
      payroll_frequency = ?, salary_cycle = ?, salary_payment_date = ?, basic_salary_pct = ?, hra_pct = ?, pf_enabled = ?, esi_enabled = ?, professional_tax = ?, tds_enabled = ?, bonus_enabled = ?, gratuity_enabled = ?, payroll_approval = ?,
      bank_name = ?, bank_branch_name = ?, account_holder_name = ?, account_number = ?, confirm_account_number = ?, ifsc_code = ?, swift_code = ?, micr_code = ?, upi_id = ?, salary_payment_method = ?,
      company_theme_color = ?, secondary_theme_color = ?, company_logo_name = ?, favicon_name = ?, login_bg_name = ?, dashboard_banner_name = ?, email_header_logo_name = ?, email_footer_logo_name = ?, company_seal_name = ?, digital_signature_name = ?,
      documents = ?,
      language = ?, time_zone = ?, currency = ?, date_format = ?, time_format = ?, password_policy = ?, two_factor_authentication = ?, session_timeout = ?, login_attempts = ?, email_notification = ?, sms_notification = ?, push_notification = ?, smtp = ?, sms_gateway = ?, google_workspace = ?, microsoft_365 = ?, biometric_device = ?
    WHERE id = 1
  `;
  
  const values = [
    p.general?.companyName, p.general?.legalCompanyName, p.general?.companyCode, p.general?.companyType, p.general?.industry, p.general?.businessType, p.general?.yearEstablished, p.general?.numberOfEmployees, p.general?.financialYear,
    p.contact?.officialEmail, p.contact?.hrEmail, p.contact?.supportEmail, p.contact?.website, p.contact?.phoneNumber, p.contact?.mobileNumber, p.contact?.alternateNumber, p.contact?.faxNumber, p.contact?.linkedinUrl, p.contact?.facebookUrl, p.contact?.twitterUrl, p.contact?.instagramUrl,
    p.address?.headOfficeAddress1, p.address?.headOfficeAddress2, p.address?.headOfficeLandmark, p.address?.headOfficeCity, p.address?.headOfficeState, p.address?.headOfficeCountry, p.address?.headOfficeZipCode, p.address?.headOfficeGoogleMapsUrl, p.address?.branchName, p.address?.branchAddress, p.address?.branchCity, p.address?.branchState, p.address?.branchCountry, p.address?.branchZipCode,
    p.business?.gstNumber, p.business?.panNumber, p.business?.cinNumber, p.business?.tanNumber, p.business?.msmeNumber, p.business?.iecCode, p.business?.pfRegistrationNumber, p.business?.esiRegistrationNumber, p.business?.professionalTaxNumber, p.business?.labourLicenseNumber, p.business?.shopEstablishmentNumber,
    p.hrSettings?.employeeIdPrefix, p.hrSettings?.autoGenerateEmployeeId, p.hrSettings?.defaultDepartment, p.hrSettings?.defaultDesignation, p.hrSettings?.probationPeriod, p.hrSettings?.noticePeriod, p.hrSettings?.defaultShift, p.hrSettings?.workingDays, p.hrSettings?.weekendPolicy, p.hrSettings?.attendanceMethod, p.hrSettings?.biometricEnabled, p.hrSettings?.overtimeEnabled, p.hrSettings?.leaveCarryForward,
    p.payroll?.payrollFrequency, p.payroll?.salaryCycle, p.payroll?.salaryPaymentDate, p.payroll?.basicSalaryPct, p.payroll?.hraPct, p.payroll?.pfEnabled, p.payroll?.esiEnabled, p.payroll?.professionalTax, p.payroll?.tdsEnabled, p.payroll?.bonusEnabled, p.payroll?.gratuityEnabled, p.payroll?.payrollApproval,
    p.banking?.bankName, p.banking?.branchName, p.banking?.accountHolderName, p.banking?.accountNumber, p.banking?.confirmAccountNumber, p.banking?.ifscCode, p.banking?.swiftCode, p.banking?.micrCode, p.banking?.upiId, p.banking?.salaryPaymentMethod,
    p.branding?.companyThemeColor, p.branding?.secondaryThemeColor, p.branding?.companyLogoName, p.branding?.faviconName, p.branding?.loginBgName, p.branding?.dashboardBannerName, p.branding?.emailHeaderLogoName, p.branding?.emailFooterLogoName, p.branding?.companySealName, p.branding?.digitalSignatureName,
    p.documents ? JSON.stringify(p.documents) : null,
    p.systemSettings?.language, p.systemSettings?.timeZone, p.systemSettings?.currency, p.systemSettings?.dateFormat, p.systemSettings?.timeFormat, p.systemSettings?.passwordPolicy, p.systemSettings?.twoFactorAuthentication, p.systemSettings?.sessionTimeout, p.systemSettings?.loginAttempts, p.systemSettings?.emailNotification, p.systemSettings?.smsNotification, p.systemSettings?.pushNotification, p.systemSettings?.smtp, p.systemSettings?.smsGateway, p.systemSettings?.googleWorkspace, p.systemSettings?.microsoft365, p.systemSettings?.biometricDevice
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: "Failed to update profile", details: err });
    res.json({ message: "Company profile updated successfully" });
  });
});

/**
 * EXPORT PDF REPORT
 */
router.post("/export-pdf", (req, res) => {
  const { generatedBy } = req.body;
  const user = generatedBy || "John Doe";

  const sql = "SELECT * FROM company_profile WHERE id = 1";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database query error", details: err });
    if (rows.length === 0) return res.status(404).json({ error: "Company profile not found" });

    const p = mapRowToProfile(rows[0]);
    
    // Log the activity
    const logSql = "INSERT INTO activity_logs (user_email, action, details) VALUES (?, ?, ?)";
    db.query(logSql, [user, "Company Profile Export", `Company profile PDF report exported by ${user}.`], (logErr) => {
      if (logErr) console.error("Activity Logging Failed:", logErr);
    });

    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=company_profile.pdf");
      doc.pipe(res);

      const primaryColor = p.branding?.companyThemeColor || "#2453D4";
      const secondaryColor = p.branding?.secondaryThemeColor || "#64748B";

      // Draw PDF structure
      const drawHeader = (currentPage, totalPages) => {
        doc.save();
        // Top blue banner background
        doc.rect(0, 0, 595, 12).fill(primaryColor);

        // Header info
        doc.fillColor("#1e293b");
        doc.font("Helvetica-Bold").fontSize(14).text(p.general?.companyName || "Hawkeye Nest Technologies Pvt Ltd", 50, 30);
        doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(p.general?.companyType || "Private Limited", 50, 45);

        // Right side date/user info
        const now = new Date();
        const exportDate = now.toLocaleDateString("en-IN") + " " + now.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
        doc.font("Helvetica").fontSize(8).fillColor("#64748b");
        doc.text(`Generated By: ${user}`, 400, 30, { align: "right", width: 145 });
        doc.text(`Exported On: ${exportDate}`, 400, 42, { align: "right", width: 145 });

        // Thin divider
        doc.moveTo(50, 60).lineTo(545, 60).lineWidth(0.5).strokeColor("#e2e8f0").stroke();
        doc.restore();
      };

      const drawFooter = (currentPage, totalPages) => {
        doc.save();
        // Divider
        doc.moveTo(50, 780).lineTo(545, 780).lineWidth(0.5).strokeColor("#e2e8f0").stroke();

        doc.font("Helvetica").fontSize(8).fillColor("#94a3b8");
        doc.text("Generated automatically by the HRMS.", 50, 790);
        doc.text("CONFIDENTIAL DOCUMENT", 240, 790, { width: 115, align: "center" });
        doc.text(`Page ${currentPage} of ${totalPages}`, 450, 790, { width: 95, align: "right" });
        doc.restore();
      };

      // Header spacing
      doc.y = 80;

      // Report Title
      doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(20).text("Company Profile Report", { align: "center" });
      doc.moveDown(1.5);

      // Utility function to draw table-like structures
      const drawSectionHeader = (title) => {
        doc.moveDown(0.5);
        doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(12).text(title);
        doc.moveDown(0.2);
        doc.moveTo(doc.x, doc.y).lineTo(545, doc.y).lineWidth(1.5).strokeColor(primaryColor).stroke();
        doc.moveDown(0.4);
      };

      const drawRow = (label1, val1, label2, val2) => {
        const startY = doc.y;
        doc.fillColor("#64748b").font("Helvetica-Bold").fontSize(9).text(label1, 50, startY, { width: 110 });
        doc.fillColor("#1e293b").font("Helvetica").fontSize(9).text(val1 || "—", 160, startY, { width: 120 });

        if (label2) {
          doc.fillColor("#64748b").font("Helvetica-Bold").fontSize(9).text(label2, 300, startY, { width: 110 });
          doc.fillColor("#1e293b").font("Helvetica").fontSize(9).text(val2 || "—", 410, startY, { width: 135 });
        }
        
        const maxY = Math.max(doc.y, startY);
        doc.y = maxY + 8; // Row spacing
      };

      // 1. Overview Section
      drawSectionHeader("Overview");
      drawRow("Company Name", p.general?.companyName, "Legal Company Name", p.general?.legalCompanyName);
      drawRow("Company Type", p.general?.companyType, "Industry", p.general?.industry);
      drawRow("Business Type", p.general?.businessType, "Established Year", p.general?.yearEstablished);
      drawRow("Official Email", p.contact?.officialEmail, "Website", p.contact?.website);
      drawRow("Phone Number", p.contact?.phoneNumber, "Mobile Number", p.contact?.mobileNumber);

      // 2. Address Section
      drawSectionHeader("Address Details");
      const fullAddress = [p.address?.headOfficeAddress1, p.address?.headOfficeAddress2, p.address?.headOfficeLandmark].filter(Boolean).join(", ");
      drawRow("Head Office Address", fullAddress);
      drawRow("City", p.address?.headOfficeCity, "State", p.address?.headOfficeState);
      drawRow("Country", p.address?.headOfficeCountry, "Postal Code", p.address?.headOfficeZipCode);
      if (p.address?.branchAddress) {
        const branchFull = [p.address?.branchAddress, p.address?.branchCity, p.address?.branchState, p.address?.branchCountry, p.address?.branchZipCode].filter(Boolean).join(", ");
        drawRow("Branch Details", `${p.address?.branchName || "Branch"}: ${branchFull}`);
      }

      // 3. Business Information
      drawSectionHeader("Business Information");
      drawRow("GST Number", p.business?.gstNumber, "PAN Number", p.business?.panNumber);
      drawRow("CIN Number", p.business?.cinNumber, "TAN Number", p.business?.tanNumber);
      drawRow("MSME Number", p.business?.msmeNumber, "IEC Code", p.business?.iecCode);

      // Trigger automatic new page for rest sections to keep layout super neat
      doc.addPage();
      doc.y = 80;

      // 4. Organization & HR Details
      drawSectionHeader("Organization & HR Settings");
      drawRow("Total Employees", p.general?.numberOfEmployees, "Working Days", p.hrSettings?.workingDays);
      drawRow("Office Hours", p.hrSettings?.defaultShift, "Weekend Policy", p.hrSettings?.weekendPolicy);
      drawRow("Attendance Policy", p.hrSettings?.attendanceMethod, "Leave Carry Forward", p.hrSettings?.leaveCarryForward ? "Yes" : "No");
      drawRow("Probation Period", `${p.hrSettings?.probationPeriod || "—"} Months`, "Notice Period", `${p.hrSettings?.noticePeriod || "—"} Days`);

      // 5. Payroll Information
      drawSectionHeader("Payroll Settings");
      drawRow("Payroll Frequency", p.payroll?.payrollFrequency, "Salary Cycle", p.payroll?.salaryCycle);
      drawRow("Payment Date", p.payroll?.salaryPaymentDate, "Currency", p.systemSettings?.currency);
      drawRow("Basic Salary", `${p.payroll?.basicSalaryPct || "50"}%`, "HRA Component", `${p.payroll?.hraPct || "40"}%`);

      // 6. Bank Information
      drawSectionHeader("Bank Details");
      // Mask bank account number (mask all but last 4 digits)
      const rawAcc = p.banking?.accountNumber || "";
      const maskedAcc = rawAcc.length > 4 
        ? rawAcc.slice(-4).padStart(rawAcc.length, "*") 
        : rawAcc;
      drawRow("Bank Name", p.banking?.bankName, "Branch Name", p.banking?.branchName);
      drawRow("Account Holder", p.banking?.accountHolderName, "Account Number", maskedAcc);
      drawRow("IFSC Code", p.banking?.ifscCode, "Salary Payment Method", p.banking?.salaryPaymentMethod);

      // Draw all headers and footers
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        drawHeader(i + 1, pages.count);
        drawFooter(i + 1, pages.count);
      }

      doc.end();
    } catch (pdfErr) {
      console.error("PDF Generation failed:", pdfErr);
      res.status(500).json({ error: "Failed to generate PDF document", details: pdfErr.message });
    }
  });
});

/**
 * GET ALL TEAMS
 */
router.get("/teams", (req, res) => {
  const sql = `
    SELECT 
      t.id,
      t.name,
      e.name as lead,
      t.description,
      (SELECT COUNT(*) FROM employees WHERE team_id = t.id) as members
    FROM teams t
    LEFT JOIN employees e ON t.team_lead_id = e.id
  `;
  db.query(sql, (err, rows) => {
    // If employees table doesn't have team_id yet, we just return 0 members
    if (err && err.code === 'ER_BAD_FIELD_ERROR') {
      const fallbackSql = `
        SELECT 
          t.id,
          t.name,
          e.name as lead,
          t.description,
          0 as members
        FROM teams t
        LEFT JOIN employees e ON t.team_lead_id = e.id
      `;
      db.query(fallbackSql, (fallbackErr, fallbackRows) => {
        if (fallbackErr) return res.status(500).json(fallbackErr);
        return res.json(fallbackRows);
      });
    } else {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  });
});

/**
 * CREATE TEAM
 */
router.post("/teams", (req, res) => {
  const { name, lead_id, description } = req.body;
  const sql = "INSERT INTO teams (name, team_lead_id, description) VALUES (?, ?, ?)";
  db.query(sql, [name, lead_id || null, description], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Team created successfully", id: result.insertId });
  });
});

/**
 * GET ALL SHIFTS
 */
router.get("/shifts", (req, res) => {
  const sql = "SELECT * FROM shifts";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/**
 * CREATE SHIFT
 */
router.post("/shifts", (req, res) => {
  const { name, start_time, end_time, grace_time, shift_type, color, status } = req.body;
  const sql = "INSERT INTO shifts (shift_name, start_time, end_time, grace_time, shift_type, color, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, start_time, end_time, grace_time || 15, shift_type || 'Regular', color || '#3B82F6', status || 'Active'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Shift created successfully", id: result.insertId });
  });
});

/**
 * GET ALL HOLIDAYS
 */
router.get("/holidays", (req, res) => {
  const sql = "SELECT * FROM holidays ORDER BY holiday_date ASC";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/**
 * CREATE HOLIDAY
 */
router.post("/holidays", (req, res) => {
  const { name, date, type, location } = req.body;
  const sql = "INSERT INTO holidays (holiday_name, holiday_date, holiday_type, location) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, date, type || 'National', location || 'All Locations'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Holiday created successfully", id: result.insertId });
  });
});

module.exports = router;
