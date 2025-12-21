const mongoose = require('mongoose');

const collateralSchema = new mongoose.Schema(
  {
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fundName: {
      type: String,
      required: true,
    },
    fundIsin: {
      type: String,
      required: true,
      description: 'ISIN code of the mutual fund',
    },
    units: {
      type: Number,
      required: true,
    },
    currentNavPerUnit: {
      type: Number,
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
      description: 'units * currentNavPerUnit',
    },
    depositoryReference: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'locked', 'released', 'liquidated'],
      default: 'active',
    },
    linkedLoanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanApplication',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Collateral', collateralSchema);
