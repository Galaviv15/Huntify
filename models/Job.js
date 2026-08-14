const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    jobHash: {
      type: String,
      required: true,
      unique: true,
      indexed: true,
    },
    title: {
      type: String,
      required: true,
      indexed: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      indexed: true,
      trim: true,
    },
    companyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    sourceType: {
      type: String,
      enum: ['DIRECT_ATS', 'PLACEMENT_AGENCY', 'MANUAL'],
      default: 'PLACEMENT_AGENCY',
    },
    sourceName: {
      type: String,
      required: true,
      indexed: true,
    },
    sourceUrl: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: 'Israel',
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    experienceLevel: {
      type: String,
      default: 'All',
    },
    techStack: {
      type: [String],
      indexed: true,
    },
    description: {
      type: String,
      default: '',
    },
    requirements: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      indexed: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      indexed: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Add compound text index for full-text search
JobSchema.index({ title: 'text', description: 'text', companyName: 'text' });

module.exports = mongoose.model('Job', JobSchema);
