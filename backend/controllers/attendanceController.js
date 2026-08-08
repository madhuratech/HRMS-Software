const db = require("../config/database");
const GPSAttendanceService = require("../services/GPSAttendanceService");
const PunchLocationService = require("../services/PunchLocationService");
const PDFDocument = require("pdfkit");

// Original endpoint for backward compatibility, updated to use GPS geofence validation
exports.punch = async (req, res) => {
  try {
    const employeeId = req.user ? req.user.id : req.body.employee_id;
    const { punch_type, latitude, longitude, device_info, browser, ip_address } = req.body;

    if (!employeeId || !punch_type || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields (employee_id/token, punch_type, latitude, longitude)" });
    }

    const punchData = {
      punchType: punch_type,
      latitude,
      longitude,
      deviceInfo: device_info || req.headers['user-agent'] || 'Unknown',
      browser: browser || 'Unknown',
      ipAddress: ip_address || req.ip || 'Unknown'
    };

    const result = await GPSAttendanceService.validateAndRecordPunch(employeeId, punchData);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Punch error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getRecent = (req, res) => {
  const { employee_id } = req.params;

  const sql = `
    SELECT punch_type, punch_time
    FROM attendance
    WHERE employee_id = ?
    ORDER BY punch_time DESC
    LIMIT 5
  `;

  db.query(sql, [employee_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Fetch failed" });
    res.json(results);
  });
};

exports.getDailyStats = (req, res) => {
  const targetDate = req.query.date || new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      e.id,
      e.name,
      e.profile_photo as avatar,
      d.dept_name as department,
      MIN(CASE WHEN a.punch_type = 'IN' THEN a.punch_time END) as check_in_time,
      MAX(CASE WHEN a.punch_type = 'OUT' THEN a.punch_time END) as check_out_time,
      (
        SELECT COUNT(*) 
        FROM leave_applications la 
        WHERE la.employee_id = e.id 
          AND la.status = 'Approved' 
          AND ? BETWEEN la.start_date AND la.end_date
      ) as on_leave
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN attendance a ON a.employee_id = e.id AND DATE(a.punch_time) = ?
    WHERE e.status = 'Active'
    GROUP BY e.id, e.name, e.profile_photo, d.dept_name
  `;

  db.query(sql, [targetDate, targetDate, targetDate], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to load daily attendance stats", error: err.message });
    }

    const records = rows.map(row => {
      let status = 'Absent';
      let checkIn = '--';
      let checkOut = '--';
      let workingHours = '00h 00m';

      if (row.check_in_time) {
        const checkInDate = new Date(row.check_in_time);
        
        checkIn = checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        const checkInHour = checkInDate.getHours();
        const checkInMin = checkInDate.getMinutes();
        if (checkInHour > 9 || (checkInHour === 9 && checkInMin > 15)) {
          status = 'Late';
        } else {
          status = 'Present';
        }

        if (row.check_out_time) {
          const checkOutDate = new Date(row.check_out_time);
          checkOut = checkOutDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          
          const diffMs = checkOutDate - checkInDate;
          if (diffMs > 0) {
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            workingHours = `${String(diffHrs).padStart(2, '0')}h ${String(diffMins).padStart(2, '0')}m`;
          }
        }
      } else if (row.on_leave > 0) {
        status = 'On Leave';
      }

      return {
        id: `EMP${String(row.id).padStart(3, '0')}`,
        name: row.name,
        avatar: row.avatar ? `/${row.avatar}` : `https://i.pravatar.cc/150?u=emp${row.id}`,
        department: row.department || 'General',
        checkIn,
        checkOut,
        status,
        workingHours
      };
    });

    const totalEmployees = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const late = records.filter(r => r.status === 'Late').length;
    const leave = records.filter(r => r.status === 'On Leave').length;
    const absent = records.filter(r => r.status === 'Absent').length;

    const formatPct = (val) => totalEmployees > 0 ? `${((val / totalEmployees) * 100).toFixed(2)}%` : '0.00%';

    res.json({
      kpis: {
        totalEmployees,
        present: present + late,
        presentPct: formatPct(present + late),
        absent,
        absentPct: formatPct(absent),
        late,
        latePct: formatPct(late),
        leave,
        leavePct: formatPct(leave)
      },
      records
    });
  });
};

exports.getGPSFeed = async (req, res) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];
    const data = await GPSAttendanceService.getGPSDashboardStats(targetDate);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("GPS feed error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// LOCATION MASTER ENDPOINTS
// ==========================================

exports.getPunchLocations = async (req, res) => {
  try {
    const data = await PunchLocationService.getLocations(req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPunchLocationById = async (req, res) => {
  try {
    const location = await PunchLocationService.getLocationById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: "Punch Location not found" });
    }
    return res.status(200).json({ success: true, location });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPunchLocation = async (req, res) => {
  try {
    const location = await PunchLocationService.createLocation(req.body);
    return res.status(201).json({ success: true, location });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePunchLocation = async (req, res) => {
  try {
    const location = await PunchLocationService.updateLocation(req.params.id, req.body);
    return res.status(200).json({ success: true, location });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePunchLocation = async (req, res) => {
  try {
    await PunchLocationService.deleteLocation(req.params.id);
    return res.status(200).json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.togglePunchLocationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const result = await PunchLocationService.toggleStatus(req.params.id, status);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// REPORTS & EXPORTS
// ==========================================

exports.getGPSReport = async (req, res) => {
  try {
    const logs = await GPSAttendanceService.getGPSReportData(req.query);
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportGPSReportPDF = async (req, res) => {
  try {
    const logs = await GPSAttendanceService.getGPSReportData(req.query);
    
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=gps_attendance_report_${Date.now()}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("GPS Geofence Attendance Report", { align: 'center' }).moveDown();
    doc.fontSize(10).text(`Generated On: ${new Date().toLocaleString()}`, { align: 'right' }).moveDown();

    // Table Headers
    const headers = ["Employee", "Date & Time", "Punch", "Location", "Distance", "Inside Geofence", "Status"];
    const colWidths = [100, 100, 50, 100, 60, 60, 50];
    const startX = 30;
    let currentY = doc.y;

    // Draw header text
    doc.fontSize(9).font('Helvetica-Bold');
    let tempX = startX;
    headers.forEach((h, i) => {
      doc.text(h, tempX, currentY, { width: colWidths[i], align: 'left' });
      tempX += colWidths[i];
    });

    doc.moveTo(startX, currentY + 12).lineTo(560, currentY + 12).stroke();
    currentY += 18;

    // Draw rows
    doc.font('Helvetica');
    logs.forEach(log => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 40;
      }
      const timeStr = new Date(log.punch_time).toLocaleString();
      const distStr = log.distance ? `${parseFloat(log.distance).toFixed(1)}m` : '0m';

      const rowValues = [
        log.employee_name,
        timeStr,
        log.punch_type,
        log.location_name || 'N/A',
        distStr,
        log.inside_radius || 'N/A',
        log.status
      ];

      let cellX = startX;
      rowValues.forEach((val, idx) => {
        doc.text(val.toString(), cellX, currentY, { width: colWidths[idx], align: 'left' });
        cellX += colWidths[idx];
      });

      doc.moveTo(startX, currentY + 10).lineTo(560, currentY + 10).strokeColor('#e5e7eb').stroke();
      currentY += 16;
    });

    doc.end();
  } catch (error) {
    console.error("PDF Export error:", error);
    return res.status(500).send("Failed to export PDF report");
  }
};

exports.exportGPSReportExcel = async (req, res) => {
  try {
    const logs = await GPSAttendanceService.getGPSReportData(req.query);

    // Build CSV content
    const headers = ["Employee ID", "Employee Name", "Punch Type", "Punch Time", "Latitude", "Longitude", "Location Name", "Distance (m)", "Inside Radius", "Device Info", "Browser", "IP Address", "Status", "Failure Reason"];
    const rows = logs.map(log => [
      log.employee_id,
      `"${log.employee_name.replace(/"/g, '""')}"`,
      log.punch_type,
      new Date(log.punch_time).toISOString(),
      log.latitude,
      log.longitude,
      `"${(log.location_name || '').replace(/"/g, '""')}"`,
      log.distance ? parseFloat(log.distance).toFixed(2) : 0,
      log.inside_radius,
      `"${(log.device_info || '').replace(/"/g, '""')}"`,
      log.browser,
      log.ip_address,
      log.status,
      `"${(log.failure_reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=gps_attendance_report_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Excel Export error:", error);
    return res.status(500).send("Failed to export Excel report");
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const employeeId = req.user ? req.user.id : req.query.employee_id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }
    const today = new Date().toISOString().split('T')[0];
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM GPSAttendance WHERE employee_id = ? AND punch_date = ?", [employeeId, today], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    if (results.length === 0) {
      return res.status(200).json({ success: true, status: 'NOT_PUNCHED' });
    }

    const rec = results[0];
    if (rec.check_in_time && !rec.check_out_time) {
      return res.status(200).json({
        success: true,
        status: 'PUNCHED_IN',
        punchInTime: new Date(rec.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkInTimeRaw: rec.check_in_time,
        latitudeIn: rec.latitude_in,
        longitudeIn: rec.longitude_in,
        locationName: rec.punch_in_location,
        statusLabel: rec.status || 'Present'
      });
    }

    return res.status(200).json({
      success: true,
      status: 'PUNCHED_OUT',
      punchInTime: new Date(rec.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      punchOutTime: new Date(rec.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      workingHours: rec.working_hours,
      statusLabel: rec.status || 'Completed'
    });

  } catch (error) {
    console.error("Failed to get today status:", error);
    return res.status(500).json({ success: false, message: "Internal server error fetching today's status" });
  }
};
