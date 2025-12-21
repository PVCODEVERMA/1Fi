const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      required: true,
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanProduct',
      required: true,
    },
    loanAmount: {
      type: Number,
      required: true,
    },
    tenure: {
      type: Number,
      required: true,
      description: 'Loan tenure in months',
    },
    interestRate: {
      type: Number,
      required: true,
    },
    collaterals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collateral',
      },
    ],
    totalCollateralValue: Number,
    loanToValueRatio: Number,
    processingFee: Number,
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'disbursed', 'closed'],
      default: 'draft',
    },
    approvalDate: Date,
    disbursementDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    comments: String,
    createdVia: {
      type: String,
      enum: ['web', 'api'],
      default: 'web',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
