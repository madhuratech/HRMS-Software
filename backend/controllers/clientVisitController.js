const ClientVisitService = require('../services/ClientVisitService');

exports.startJourney = async (req, res) => {
  try {
    const employeeId = req.user.employeeId || req.user.employee_id || (req.user.role === 'SUPER_ADMIN' ? 1 : req.user.id);
    const { clientName, lat, lng, clientAddress, destLat, destLng } = req.body;
    
    if (!clientName || !lat || !lng) {
      return res.status(400).json({ success: false, message: "Missing required fields (clientName, lat, lng)" });
    }

    const visit = await ClientVisitService.startJourney(
      employeeId, clientName,
      parseFloat(lat), parseFloat(lng),
      clientAddress || null,
      destLat ? parseFloat(destLat) : null,
      destLng ? parseFloat(destLng) : null
    );
    res.json({ success: true, visit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reachClient = async (req, res) => {
  try {
    const { visitId, lat, lng } = req.body;
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }
    
    if (!visitId || !lat || !lng || !photoUrl) {
      return res.status(400).json({ success: false, message: "Missing required fields (visitId, lat, lng, photo)" });
    }

    await ClientVisitService.reachClient(visitId, parseFloat(lat), parseFloat(lng), photoUrl);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.endMeeting = async (req, res) => {
  try {
    const { visitId, lat, lng } = req.body;
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }
    
    if (!visitId || !lat || !lng || !photoUrl) {
      return res.status(400).json({ success: false, message: "Missing required fields (visitId, lat, lng, photo)" });
    }

    await ClientVisitService.endMeeting(visitId, parseFloat(lat), parseFloat(lng), photoUrl);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reachOffice = async (req, res) => {
  try {
    const employeeId = req.user.employeeId || req.user.employee_id || (req.user.role === 'SUPER_ADMIN' ? 1 : req.user.id);
    const { visitId, lat, lng } = req.body;
    
    if (!visitId || !lat || !lng) {
      return res.status(400).json({ success: false, message: "Missing required fields (visitId, lat, lng)" });
    }

    const result = await ClientVisitService.reachOffice(visitId, employeeId, parseFloat(lat), parseFloat(lng));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.trackLocation = async (req, res) => {
  try {
    const employeeId = req.user.employeeId || req.user.employee_id || (req.user.role === 'SUPER_ADMIN' ? 1 : req.user.id);
    const { visitId, lat, lng } = req.body;
    
    if (!visitId || !lat || !lng) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    await ClientVisitService.trackLocation(visitId, employeeId, parseFloat(lat), parseFloat(lng));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveVisits = async (req, res) => {
  try {
    const employeeId = req.user.employeeId || req.user.employee_id || (req.user.role === 'SUPER_ADMIN' ? 1 : req.user.id);
    const role = req.user.role;
    let visits = [];
    let completed = [];
    if (role === 'SUPER_ADMIN' || role === 'SALES_MANAGER' || role === 'TEAM_LEADER' || role === 'ADMIN') {
      const data = await ClientVisitService.getLiveVisits();
      visits = data.activeVisits;
      completed = data.completedVisits;
    } else {
      visits = await ClientVisitService.getActiveVisitsForEmployee(employeeId);
      completed = await ClientVisitService.getCompletedVisitsForEmployee(employeeId);
    }
    res.json({ success: true, visits, completedVisits: completed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLiveDashboard = async (req, res) => {
  try {
    const data = await ClientVisitService.getLiveVisits();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLiveTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ClientVisitService.getLiveVisitDetails(id);
    res.json({ success: true, ...data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
