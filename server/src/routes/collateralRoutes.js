const express = require('express');
const router = express.Router();
const {
  addCollateral,
  getBorrowerCollaterals,
  updateCollateral,
  removeCollateral,
} = require('../controllers/collateralController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, addCollateral);
router.get('/', authMiddleware, getBorrowerCollaterals);
router.put('/:id', authMiddleware, updateCollateral);
router.delete('/:id', authMiddleware, removeCollateral);

module.exports = router;
