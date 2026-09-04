const ClientVisitService = require('../services/ClientVisitService');

exports.startVisit = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { clientName, lat, lng } = req.body;
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }
    
    if (!clientName || !lat || !lng || !photoUrl) {
      return res.status(400).json({ success: false, message: "Missing required fields (clientName, lat, lng, photo)" });
    }

    const visit = await ClientVisitService.startVisit(employeeId, clientName, parseFloat(lat), parseFloat(lng), photoUrl);
    res.json({ success: true, visit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.trackLocation = async (req, res) => {
  try {
    const employeeId = req.user.id;
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

exports.endVisit = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { visitId, lat, lng } = req.body;
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    if (!visitId || !lat || !lng || !photoUrl) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const result = await ClientVisitService.endVisit(visitId, employeeId, parseFloat(lat), parseFloat(lng), photoUrl);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveVisits = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const role = req.user.role;
    let visits = [];
    let completed = [];
    if (role === 'SUPER_ADMIN' || role === 'SALES_MANAGER' || role === 'TEAM_LEADER') {
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
    // Ideally check if req.user has TL/Manager rights, but we handle it in frontend logic for now
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
