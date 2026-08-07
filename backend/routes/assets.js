const express = require('express');
const router = express.Router();
const AssetAllocationController = require('../controllers/AssetAllocationController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateAssetAllocation } = require('../validators/assetAllocationValidator');

router.get('/', authenticateJWT, AssetAllocationController.list);
router.get('/dashboard', authenticateJWT, AssetAllocationController.getDashboard);
router.get('/available', authenticateJWT, AssetAllocationController.getAvailableAssets);
router.get('/:id', authenticateJWT, AssetAllocationController.getById);

router.post('/', authenticateJWT, validationMiddleware(validateAssetAllocation), AssetAllocationController.allocate);
router.put('/:id/return', authenticateJWT, AssetAllocationController.returnAsset);
router.delete('/:id', authenticateJWT, AssetAllocationController.delete);

module.exports = router;
