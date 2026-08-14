const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    jobRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['SAVED', 'APPLIED', 'HR_SCREEN', 'TECH_INTERVIEW', 'HOME_ASSIGNMENT', 'OFFER', 'REJECTED'],
      default: 'SAVED',
      indexed: true,
    },
    appliedDate: {
      type: Date,
      default: null,
    },
    applyMethod: {
      type: String,
      default: 'Website',
    },
    contactPerson: {
      type: String,
      default: '',
    },
    salaryExpectation: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', ApplicationSchema);
