const express = require('express');
const router = express.Router();
const RbacController = require('../controllers/RbacController');
const { authenticateJWT } = require('../middlewares/auth');

router.use(authenticateJWT);

router.get('/modules', RbacController.getModules);
router.get('/roles', RbacController.getRoles);
router.get('/permissions/:roleKey', RbacController.getRolePermissions);
router.post('/roles', RbacController.createRole);
router.put('/permissions/:roleKey', RbacController.updateRolePermissions);
router.delete('/roles/:roleKey', RbacController.deleteRole);
router.get('/user-permissions', RbacController.getUserPermissions);

module.exports = router;
