const mongoose = require('mongoose');

const repaymentScheduleSchema = new mongoose.Schema(
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
    installmentNumber: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    principalAmount: Number,
    interestAmount: Number,
    totalAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'partial'],
      default: 'pending',
    },
    paidDate: Date,
    paidAmount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('RepaymentSchedule', repaymentScheduleSchema);
