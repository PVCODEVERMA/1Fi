const mongoose = require('mongoose');

const disbursementSchema = new mongoose.Schema(
  {
    loanApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanApplication',
      required: true,
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    disbursementAmount: Number,
    disbursementDate: Date,
    bankAccountNumber: String,
    bankName: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
    },
    remarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disbursement', disbursementSchema);
