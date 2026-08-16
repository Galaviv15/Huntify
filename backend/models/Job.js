const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    jobHash: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      index: true,
    },
    companyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    sourceType: {
      type: String,
      enum: ['AGENCY', 'DIRECT_ATS'],
      default: 'AGENCY',
    },
    sourceName: {
      type: String,
      required: true,
      index: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    location: String,
    department: String,
    experienceLevel: String,
    techStack: {
      type: [String],
      index: true,
    },
    description: String,
    requirements: [String],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Create text index for search
jobSchema.index({ title: 'text', description: 'text', companyName: 'text' });

module.exports = mongoose.model('Job', jobSchema);
