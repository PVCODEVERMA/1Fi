const mongoose = require('mongoose');

const loanProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    minLoanAmount: {
      type: Number,
      required: true,
    },
    maxLoanAmount: {
      type: Number,
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
      description: 'Annual interest rate in percentage',
    },
    processingFeePercentage: {
      type: Number,
      default: 1,
    },
    minLoanTenure: {
      type: Number,
      required: true,
      description: 'Minimum tenure in months',
    },
    maxLoanTenure: {
      type: Number,
      required: true,
      description: 'Maximum tenure in months',
    },
    collateralRequirementPercentage: {
      type: Number,
      default: 50,
      description: 'LTV (Loan to Value) ratio - percentage of mutual fund value that can be lent',
    },
    eligibilityAge: {
      min: {
        type: Number,
        default: 21,
      },
      max: {
        type: Number,
        default: 65,
      },
    },
    minCreditScore: {
      type: Number,
      default: 600,
    },
    features: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoanProduct', loanProductSchema);
