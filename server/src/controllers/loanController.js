const LoanApplication = require('../models/LoanApplication');
const LoanProduct = require('../models/LoanProduct');
const Collateral = require('../models/Collateral');
const RepaymentSchedule = require('../models/RepaymentSchedule');
const { generateApplicationNumber, calculateEmi } = require('../utils/helpers');

const createLoanApplication = async (req, res) => {
  try {
    const { productId, loanAmount, tenure, collateralIds } = req.body;
    const borrowerId = req.user.userId;

    // Validate product
    const product = await LoanProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate loan amount
    if (loanAmount < product.minLoanAmount || loanAmount > product.maxLoanAmount) {
      return res.status(400).json({
        error: `Loan amount must be between ${product.minLoanAmount} and ${product.maxLoanAmount}`,
      });
    }

    // Validate tenure
    if (tenure < product.minLoanTenure || tenure > product.maxLoanTenure) {
      return res.status(400).json({
        error: `Tenure must be between ${product.minLoanTenure} and ${product.maxLoanTenure} months`,
      });
    }

    // Validate collaterals
    const collaterals = await Collateral.find({
      _id: { $in: collateralIds },
      borrowerId,
      isActive: true,
    });

    if (collaterals.length === 0) {
      return res.status(400).json({ error: 'No valid collaterals found' });
    }

    const totalCollateralValue = collaterals.reduce((sum, c) => sum + c.totalValue, 0);
    const loanToValueRatio = (loanAmount / totalCollateralValue) * 100;

    if (loanToValueRatio > product.collateralRequirementPercentage) {
      return res.status(400).json({
        error: `LTV ratio cannot exceed ${product.collateralRequirementPercentage}%`,
      });
    }

    // Create application
    const applicationNumber = generateApplicationNumber();
    const processingFee = loanAmount * (product.processingFeePercentage / 100);

    const application = new LoanApplication({
      applicationNumber,
      borrowerId,
      productId,
      loanAmount,
      tenure,
      interestRate: product.interestRate,
      collaterals: collateralIds,
      totalCollateralValue,
      loanToValueRatio,
      processingFee,
      status: 'submitted',
      createdVia: 'web',
    });

    await application.save();

    // Generate repayment schedule
    const emi = calculateEmi(loanAmount, product.interestRate, tenure);
    const schedules = [];
    let remainingBalance = loanAmount;

    for (let i = 1; i <= tenure; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);

      const interestAmount = (remainingBalance * (product.interestRate / 12 / 100));
      const principalAmount = emi - interestAmount;

      schedules.push({
        loanApplicationId: application._id,
        borrowerId,
        installmentNumber: i,
        dueDate,
        principalAmount,
        interestAmount,
        totalAmount: emi,
        status: 'pending',
      });

      remainingBalance -= principalAmount;
    }

    await RepaymentSchedule.insertMany(schedules);

    res.status(201).json({
      message: 'Loan application created successfully',
      application,
      emi: Math.round(emi * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLoanApplications = async (req, res) => {
  try {
    const { status, borrowerId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (borrowerId) query.borrowerId = borrowerId;
    else if (req.user.role === 'applicant') query.borrowerId = req.user.userId;

    const applications = await LoanApplication.find(query)
      .populate('borrowerId', 'firstName lastName email phone')
      .populate('productId', 'name interestRate')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLoanApplicationById = async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id)
      .populate('borrowerId')
      .populate('productId')
      .populate('collaterals')
      .populate('approvedBy', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check authorization
    if (req.user.role === 'applicant' && application.borrowerId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveLoanApplication = async (req, res) => {
  try {
    const { comments } = req.body;
    const application = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvalDate: new Date(),
        approvedBy: req.user.userId,
        comments,
      },
      { new: true }
    );

    res.json({
      message: 'Loan application approved',
      application,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectLoanApplication = async (req, res) => {
  try {
    const { comments } = req.body;
    const application = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approvedBy: req.user.userId,
        comments,
      },
      { new: true }
    );

    res.json({
      message: 'Loan application rejected',
      application,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOngoingLoans = async (req, res) => {
  try {
    const { borrowerId } = req.query;
    const query = { status: { $in: ['approved', 'disbursed'] } };

    if (borrowerId) query.borrowerId = borrowerId;
    else if (req.user.role === 'applicant') query.borrowerId = req.user.userId;

    const loans = await LoanApplication.find(query)
      .populate('borrowerId', 'firstName lastName email')
      .populate('productId', 'name')
      .sort({ disbursementDate: -1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLoanApplication,
  getLoanApplications,
  getLoanApplicationById,
  approveLoanApplication,
  rejectLoanApplication,
  getOngoingLoans,
};
