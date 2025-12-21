const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'loan_officer', 'applicant'],
      default: 'applicant',
    },
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    panNumber: String,
    aadhaarNumber: String,
    employmentStatus: {
      type: String,
      enum: ['employed', 'self-employed', 'unemployed'],
    },
    monthlyIncome: Number,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
