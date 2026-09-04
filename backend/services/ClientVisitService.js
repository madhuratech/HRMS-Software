const db = require('../config/database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class ClientVisitService {
  static async startVisit(employeeId, clientName, lat, lng, photoUrl) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const result = await query(`
      INSERT INTO client_visits 
      (employee_id, client_name, date, check_in_time, check_in_lat, check_in_lng, photo_in_url, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')
    `, [employeeId, clientName, today, now, lat, lng, photoUrl]);
    
    const visitId = result.insertId;
    
    // Also save the initial point in LocationHistory
    await query(`
      INSERT INTO LocationHistory (employee_id, latitude, longitude, visit_id, recorded_at)
      VALUES (?, ?, ?, ?, ?)
    `, [employeeId, lat, lng, visitId, now]);

    return { id: visitId, employee_id: employeeId, status: 'Active' };
  }

  static async trackLocation(visitId, employeeId, lat, lng) {
    await query(`
      INSERT INTO LocationHistory (employee_id, latitude, longitude, visit_id)
      VALUES (?, ?, ?, ?)
    `, [employeeId, lat, lng, visitId]);
    return { success: true };
  }

  static async endVisit(visitId, employeeId, lat, lng, photoUrl) {
    // 1. Get all points for this visit to calculate total distance
    const points = await query(`
      SELECT latitude, longitude FROM LocationHistory
      WHERE visit_id = ? AND employee_id = ?
      ORDER BY recorded_at ASC
    `, [visitId, employeeId]);
    
    // Add the final point
    points.push({ latitude: lat, longitude: lng });

    let totalDistanceKm = 0;
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      totalDistanceKm += getDistanceFromLatLonInKm(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    }

    // Rate = 5 per km
    const fee = totalDistanceKm * 5;
    const now = new Date();

    await query(`
      UPDATE client_visits
      SET check_out_time = ?, check_out_lat = ?, check_out_lng = ?, photo_out_url = ?, distance_travelled = ?, calculated_fee = ?, status = 'Completed'
      WHERE id = ? AND employee_id = ?
    `, [now, lat, lng, photoUrl, totalDistanceKm, fee, visitId, employeeId]);

    // Save final point
    await query(`
      INSERT INTO LocationHistory (employee_id, latitude, longitude, visit_id, recorded_at)
      VALUES (?, ?, ?, ?, ?)
    `, [employeeId, lat, lng, visitId, now]);

    return { success: true, distance: totalDistanceKm.toFixed(2), fee: fee.toFixed(2) };
  }

  static async getActiveVisitsForEmployee(employeeId) {
    const visits = await query(`
      SELECT * FROM client_visits
      WHERE employee_id = ? AND status = 'Active'
    `, [employeeId]);
    return visits;
  }

  static async getLiveVisits() {
    // Fetch all active visits and their latest location
    const activeVisits = await query(`
      SELECT cv.id, cv.employee_id, cv.client_name, cv.check_in_time, e.name as employee_name,
             (SELECT latitude FROM LocationHistory lh WHERE lh.visit_id = cv.id ORDER BY recorded_at DESC LIMIT 1) as last_lat,
             (SELECT longitude FROM LocationHistory lh WHERE lh.visit_id = cv.id ORDER BY recorded_at DESC LIMIT 1) as last_lng,
             (SELECT recorded_at FROM LocationHistory lh WHERE lh.visit_id = cv.id ORDER BY recorded_at DESC LIMIT 1) as last_update
      FROM client_visits cv
      JOIN employees e ON cv.employee_id = e.id
      WHERE cv.status = 'Active'
    `);
    
    // Also fetch completed visits for today just to show on dashboard
    const today = new Date().toISOString().split('T')[0];
    const completedVisits = await query(`
      SELECT cv.id, cv.employee_id, cv.client_name, cv.check_in_time, cv.check_out_time, cv.distance_travelled, cv.calculated_fee, e.name as employee_name
      FROM client_visits cv
      JOIN employees e ON cv.employee_id = e.id
      WHERE cv.date = ? AND cv.status = 'Completed'
    `, [today]);

    return { activeVisits, completedVisits };
  }
}

module.exports = ClientVisitService;
