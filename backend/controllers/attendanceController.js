const db = require("../config/database");

exports.punch = (req, res) => {
  const { employee_id, punch_type, latitude, longitude } = req.body;

  if (!employee_id || !punch_type) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = `
    INSERT INTO attendance (employee_id, punch_type, latitude, longitude)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [employee_id, punch_type, latitude, longitude],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Punch failed" });
      }

      res.json({
        success: true,
        message: `Punch ${punch_type} successful`,
      });
    }
  );
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
        
        // Format check-in time
        checkIn = checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        // Check if late (after 09:15 AM)
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

    // Compute KPIs
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

exports.getGPSFeed = (req, res) => {
  const targetDate = req.query.date || new Date().toISOString().split('T')[0];

  const sql = `
    SELECT
      e.id as employee_id,
      e.name,
      e.profile_photo,
      MIN(CASE WHEN a.punch_type = 'IN'  THEN a.punch_time END) as check_in_time,
      MAX(CASE WHEN a.punch_type = 'OUT' THEN a.punch_time END) as check_out_time,
      (SELECT latitude  FROM attendance WHERE employee_id = e.id AND DATE(punch_time) = ? ORDER BY punch_time DESC LIMIT 1) as last_lat,
      (SELECT longitude FROM attendance WHERE employee_id = e.id AND DATE(punch_time) = ? ORDER BY punch_time DESC LIMIT 1) as last_lng
    FROM employees e
    INNER JOIN attendance a ON a.employee_id = e.id AND DATE(a.punch_time) = ?
    GROUP BY e.id, e.name, e.profile_photo
    ORDER BY MIN(a.punch_time) DESC
  `;

  db.query(sql, [targetDate, targetDate, targetDate], (err, rows) => {
    if (err) {
      console.error("GPS feed error:", err);
      return res.status(500).json({ message: "Failed to load GPS feed", error: err.message });
    }

    const GEOFENCES = [
      { id: 1, name: 'Main Headquarters',         lat: 12.9718, lng: 77.5945, radius: 100 },
      { id: 2, name: 'Branch Office - Downtown',   lat: 12.9730, lng: 77.6190, radius: 150 },
      { id: 3, name: 'Remote Office - Tech Hub',   lat: 12.9302, lng: 77.5315, radius: 200 },
      { id: 4, name: 'Client Site - Retail Center', lat: 13.0010, lng: 77.5725, radius: 250 },
    ];

    function getDistance(lat1, lng1, lat2, lng2) {
      const R = 6371000;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2)*Math.sin(dLat/2)
              + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function resolveZone(lat, lng) {
      if (!lat || !lng) return { name: 'Unknown Location', onSite: false };
      for (const z of GEOFENCES) {
        if (getDistance(parseFloat(lat), parseFloat(lng), z.lat, z.lng) <= z.radius)
          return { name: z.name, onSite: true };
      }
      return { name: 'Outside Geofence', onSite: false };
    }

    const records = rows.map(row => {
      const zone = resolveZone(row.last_lat, row.last_lng);
      const fmt = t => t ? new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';
      const lat = row.last_lat ? parseFloat(row.last_lat).toFixed(4) : null;
      const lng = row.last_lng ? parseFloat(row.last_lng).toFixed(4) : null;
      return {
        employee_id: row.employee_id,
        name: row.name,
        avatar: row.profile_photo ? `/${row.profile_photo}` : null,
        location: zone.name,
        checkIn: fmt(row.check_in_time),
        checkOut: fmt(row.check_out_time),
        coordinates: lat && lng ? `${lat}° N, ${lng}° E` : 'N/A',
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        status: zone.onSite ? 'On-Site' : 'Remote'
      };
    });

    const onSite = records.filter(r => r.status === 'On-Site').length;
    const remote = records.filter(r => r.status === 'Remote').length;
    const geofences = GEOFENCES.map(z => ({
      ...z,
      activeStaff: records.filter(r => r.location === z.name).length
    }));

    res.json({
      success: true,
      kpis: { totalCheckins: records.length, onSite, remote, activeGeofences: GEOFENCES.length },
      records,
      geofences
    });
  });
};
