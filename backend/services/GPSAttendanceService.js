const db = require('../config/database');
const PunchLocationService = require('./PunchLocationService');

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

class GPSAttendanceService {
  // Haversine formula to compute distance in meters
  static getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  }

  static async validateAndRecordPunch(employeeId, data) {
    const { punchType, latitude, longitude, deviceInfo, browser, ipAddress } = data;

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error("Invalid GPS coordinates provided.");
    }

    // Get active locations
    const activeLocations = await PunchLocationService.getActiveLocations();
    if (activeLocations.length === 0) {
      // Log failed attempt
      await this.logPunchAttempt(employeeId, punchType, lat, lng, 'No Office Location', 0, 'No', deviceInfo, browser, ipAddress, 'Failed', 'No active office locations configured.');
      throw new Error("Attendance settings error: No active office punch locations configured.");
    }

    let nearestLocation = null;
    let minDistance = Infinity;

    for (const loc of activeLocations) {
      const dist = this.getDistance(lat, lng, parseFloat(loc.latitude), parseFloat(loc.longitude));
      if (dist < minDistance) {
        minDistance = dist;
        nearestLocation = loc;
      }
    }

    const insideRadius = minDistance <= nearestLocation.radius ? 'Yes' : 'No';

    if (insideRadius === 'No') {
      // Log failed punch attempt
      await this.logPunchAttempt(employeeId, punchType, lat, lng, nearestLocation.name, minDistance, 'No', deviceInfo, browser, ipAddress, 'Failed', 'Outside allowed geofence radius.');
      throw new Error("You are outside the allowed office location. Attendance cannot be recorded.");
    }

    // Successful punch.
    const punchDate = new Date().toISOString().split('T')[0];
    const timestamp = new Date();

    // 1. Log punch attempt
    await this.logPunchAttempt(employeeId, punchType, lat, lng, nearestLocation.name, minDistance, 'Yes', deviceInfo, browser, ipAddress, 'Success', null);

    // 2. Add to GPSAttendance summary table (aggregating check_in and check_out)
    const existing = await query("SELECT * FROM GPSAttendance WHERE employee_id = ? AND punch_date = ?", [employeeId, punchDate]);

    if (existing.length === 0) {
      // Insert new check-in or record
      const sqlInsert = `
        INSERT INTO GPSAttendance (employee_id, punch_date, check_in_time, check_out_time, latitude, longitude, location_name, distance, inside_radius, device_info, browser, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await query(sqlInsert, [
        employeeId,
        punchDate,
        punchType === 'IN' ? timestamp : null,
        punchType === 'OUT' ? timestamp : null,
        lat,
        lng,
        nearestLocation.name,
        minDistance,
        'Yes',
        deviceInfo,
        browser,
        ipAddress
      ]);
    } else {
      // Update existing record
      let sqlUpdate = '';
      const params = [];
      if (punchType === 'IN') {
        sqlUpdate = `
          UPDATE GPSAttendance
          SET check_in_time = ?, latitude = ?, longitude = ?, location_name = ?, distance = ?, inside_radius = ?, device_info = ?, browser = ?, ip_address = ?
          WHERE employee_id = ? AND punch_date = ?
        `;
        params.push(timestamp, lat, lng, nearestLocation.name, minDistance, 'Yes', deviceInfo, browser, ipAddress, employeeId, punchDate);
      } else {
        sqlUpdate = `
          UPDATE GPSAttendance
          SET check_out_time = ?, latitude = ?, longitude = ?, location_name = ?, distance = ?, inside_radius = ?, device_info = ?, browser = ?, ip_address = ?
          WHERE employee_id = ? AND punch_date = ?
        `;
        params.push(timestamp, lat, lng, nearestLocation.name, minDistance, 'Yes', deviceInfo, browser, ipAddress, employeeId, punchDate);
      }
      await query(sqlUpdate, params);
    }

    // 3. To maintain backward compatibility with other modules, sync to the original attendance table
    const sqlSync = `
      INSERT INTO attendance (employee_id, punch_type, punch_time, latitude, longitude)
      VALUES (?, ?, ?, ?, ?)
    `;
    await query(sqlSync, [employeeId, punchType, timestamp, lat, lng]);

    return {
      success: true,
      locationName: nearestLocation.name,
      distance: minDistance.toFixed(2),
      punchType
    };
  }

  static async logPunchAttempt(employeeId, punchType, lat, lng, locationName, distance, insideRadius, deviceInfo, browser, ipAddress, status, reason) {
    const sql = `
      INSERT INTO AttendanceLogs (employee_id, punch_type, latitude, longitude, location_name, distance, inside_radius, device_info, browser, ip_address, status, failure_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await query(sql, [employeeId, punchType, lat, lng, locationName, distance, insideRadius, deviceInfo, browser, ipAddress, status, reason]);

    // Update LocationHistory if successful
    if (status === 'Success') {
      await query(`INSERT INTO LocationHistory (employee_id, latitude, longitude) VALUES (?, ?, ?)`, [employeeId, lat, lng]);
    }
  }

  static async getGPSDashboardStats(targetDate) {
    const date = targetDate || new Date().toISOString().split('T')[0];

    // 1. KPIs
    // Total Checkins: employees checked in today in GPSAttendance
    const statsRow = await query(`
      SELECT 
        COUNT(DISTINCT employee_id) as total_checkins,
        SUM(CASE WHEN check_in_time IS NOT NULL AND inside_radius = 'Yes' THEN 1 ELSE 0 END) as onsite_checkins,
        SUM(CASE WHEN check_in_time IS NOT NULL AND inside_radius = 'No' THEN 1 ELSE 0 END) as remote_checkins
      FROM GPSAttendance
      WHERE punch_date = ?
    `, [date]);

    // Active geofence locations
    const geofenceCountRow = await query(`SELECT COUNT(*) as active_geofences FROM GeofenceLocations WHERE status = 'Active'`);

    const totalCheckins = statsRow[0].total_checkins || 0;
    const onSite = statsRow[0].onsite_checkins || 0;
    const remote = statsRow[0].remote_checkins || 0;
    const activeGeofences = geofenceCountRow[0].active_geofences || 0;

    // 2. Geofence Zones list with today's count
    const geofenceZones = await query(`
      SELECT 
        id, 
        name, 
        latitude as lat, 
        longitude as lng, 
        radius,
        (
          SELECT COUNT(DISTINCT g.employee_id)
          FROM GPSAttendance g
          WHERE g.punch_date = ? AND g.location_name = GeofenceLocations.name
        ) as activeStaff
      FROM GeofenceLocations
      WHERE status = 'Active'
    `, [date]);

    // 3. Live GPS Feed (records)
    const sqlFeed = `
      SELECT 
        g.employee_id,
        e.name,
        e.profile_photo as avatar,
        g.location_name as location,
        g.latitude as lat,
        g.longitude as lng,
        g.check_in_time,
        g.check_out_time,
        g.distance,
        g.inside_radius
      FROM GPSAttendance g
      JOIN employees e ON e.id = g.employee_id
      WHERE g.punch_date = ?
      ORDER BY g.created_at DESC
    `;
    const rows = await query(sqlFeed, [date]);

    const records = rows.map(r => {
      const fmt = t => t ? new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';
      const lat = r.lat ? parseFloat(r.lat).toFixed(4) : null;
      const lng = r.lng ? parseFloat(r.lng).toFixed(4) : null;
      return {
        employee_id: r.employee_id,
        name: r.name,
        avatar: r.avatar ? `/${r.avatar}` : null,
        location: r.location,
        checkIn: fmt(r.check_in_time),
        checkOut: fmt(r.check_out_time),
        coordinates: lat && lng ? `${lat}° N, ${lng}° E` : 'N/A',
        lat: r.lat ? parseFloat(r.lat) : null,
        lng: r.lng ? parseFloat(r.lng) : null,
        status: r.inside_radius === 'Yes' ? 'On-Site' : 'Remote',
        distance: r.distance ? parseFloat(r.distance).toFixed(2) : '0'
      };
    });

    return {
      kpis: {
        totalCheckins,
        onSite,
        remote,
        activeGeofences
      },
      records,
      geofences: geofenceZones.map(z => ({
        id: z.id,
        name: z.name,
        lat: parseFloat(z.lat),
        lng: parseFloat(z.lng),
        radius: parseInt(z.radius),
        activeStaff: parseInt(z.activeStaff)
      }))
    };
  }

  static async getGPSReportData(filters = {}) {
    const { startDate, endDate, employeeId } = filters;
    let where = 'WHERE 1=1';
    const params = [];

    if (startDate) {
      where += ' AND l.punch_time >= ?';
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      where += ' AND l.punch_time <= ?';
      params.push(`${endDate} 23:59:59`);
    }
    if (employeeId) {
      where += ' AND l.employee_id = ?';
      params.push(employeeId);
    }

    const sql = `
      SELECT 
        l.id,
        l.employee_id,
        e.name as employee_name,
        l.punch_type,
        l.punch_time,
        l.latitude,
        l.longitude,
        l.location_name,
        l.distance,
        l.inside_radius,
        l.status,
        l.device_info,
        l.browser,
        l.ip_address
      FROM AttendanceLogs l
      JOIN employees e ON e.id = l.employee_id
      ${where}
      ORDER BY l.punch_time DESC
    `;
    return await query(sql, params);
  }
}

module.exports = GPSAttendanceService;
