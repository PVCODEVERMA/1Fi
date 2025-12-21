const express = require('express');
const router = express.Router();
const {
  createLoanApplication,
  getLoanApplications,
  getLoanApplicationById,
  approveLoanApplication,
  rejectLoanApplication,
  getOngoingLoans,
} = require('../controllers/loanController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// API endpoints - can be used by fintech companies
router.post('/api/applications', createLoanApplication); // Public API
router.get('/api/applications/:id', getLoanApplicationById); // Public API

// Web endpoints - require authentication
router.post('/', authMiddleware, createLoanApplication);
router.get('/', authMiddleware, getLoanApplications);
router.get('/:id', authMiddleware, getLoanApplicationById);
router.patch('/:id/approve', authMiddleware, roleMiddleware(['admin', 'loan_officer']), approveLoanApplication);
router.patch('/:id/reject', authMiddleware, roleMiddleware(['admin', 'loan_officer']), rejectLoanApplication);
router.get('/status/ongoing', authMiddleware, getOngoingLoans);

module.exports = router;
