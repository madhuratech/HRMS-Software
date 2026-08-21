const express = require('express');
const router = express.Router();
const TeamMemberController = require('../controllers/TeamMemberController');
const { authenticateJWT, checkRole } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateTeamMember } = require('../validators/teamMemberValidator');

const readRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager', 'Viewer'];
const writeRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager'];

router.get('/', authenticateJWT, checkRole(readRoles), TeamMemberController.list);
router.get('/meta', authenticateJWT, checkRole(readRoles), TeamMemberController.meta);

router.post('/', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateTeamMember), TeamMemberController.assign);
router.put('/:id', authenticateJWT, checkRole(writeRoles), TeamMemberController.update);
router.delete('/:id', authenticateJWT, checkRole(writeRoles), TeamMemberController.remove);

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> origin/main
