const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'],
      default: 'SAVED',
      index: true,
    },
    appliedAt: Date,
    interviewDate: Date,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
