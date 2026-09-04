const express = require('express');
const router = express.Router();
const clientVisitController = require('../controllers/clientVisitController');
const authenticateJWT = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-visit-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

router.post('/start', authenticateJWT, upload.single('photo'), clientVisitController.startVisit);
router.post('/track', authenticateJWT, clientVisitController.trackLocation);
router.post('/end', authenticateJWT, upload.single('photo'), clientVisitController.endVisit);
router.get('/active', authenticateJWT, clientVisitController.getActiveVisits);
router.get('/live', authenticateJWT, clientVisitController.getLiveDashboard);

module.exports = router;
