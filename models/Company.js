const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      indexed: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    websiteUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    sncUrl: {
      type: String,
      default: '',
    },
    overview: {
      type: String,
      default: '',
    },
    foundedYear: {
      type: String,
      default: 'N/A',
    },
    businessModel: {
      type: String,
      default: 'B2B',
    },
    employeeCount: {
      type: String,
      default: 'N/A',
    },
    fundingStage: {
      type: String,
      default: 'N/A',
    },
    fundingAmount: {
      type: String,
      default: 'N/A',
    },
    stealthMode: {
      type: Boolean,
      default: false,
    },
    ats: {
      provider: {
        type: String,
        enum: ['Comeet', 'Greenhouse', 'Lever', 'Ashby', 'Workable', 'None'],
        default: 'None',
      },
      slug: {
        type: String,
        default: '',
      },
      uid: {
        type: String,
        default: '',
      },
      careersUrl: {
        type: String,
        default: '',
      },
      lastCheckedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);
